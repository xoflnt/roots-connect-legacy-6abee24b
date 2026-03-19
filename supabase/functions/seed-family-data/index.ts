import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

import { familyMembers } from "../_shared/family-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FamilyMember {
  id: string;
  name: string;
  father_id: string | null;
  [key: string]: unknown;
}

interface ErrorRecord {
  id: string;
  name: string;
  father_id: string | null;
  error: string;
  phase: "batch" | "retry";
}

interface SyncResult {
  success: boolean;
  total: number;
  inserted: number;
  orphans_cleaned: number;
  errors: ErrorRecord[];
  diagnostics: {
    original_with_father: number;
    fathers_outside_set: string[];
    kahn_sorted_count: number;
    kahn_unsorted_count: number;
    batch_count: number;
  };
}

function kahnSort(members: FamilyMember[]): {
  sorted: FamilyMember[];
  unsorted: FamilyMember[];
} {
  const idSet = new Set(members.map((m) => m.id));
  const memberMap = new Map<string, FamilyMember>();
  const inDegree = new Map<string, number>();
  const childrenOf = new Map<string, string[]>();

  for (const m of members) {
    memberMap.set(m.id, m);
    inDegree.set(m.id, 0);
    childrenOf.set(m.id, []);
  }

  for (const m of members) {
    if (m.father_id && idSet.has(m.father_id)) {
      inDegree.set(m.id, (inDegree.get(m.id) ?? 0) + 1);
      childrenOf.get(m.father_id)!.push(m.id);
    }
  }

  const queue: string[] = [];
  for (const m of members) {
    if (inDegree.get(m.id) === 0) queue.push(m.id);
  }

  const sorted: FamilyMember[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    sorted.push(memberMap.get(id)!);
    for (const childId of childrenOf.get(id) ?? []) {
      const newDegree = (inDegree.get(childId) ?? 1) - 1;
      inDegree.set(childId, newDegree);
      if (newDegree === 0) queue.push(childId);
    }
  }

  const unsorted: FamilyMember[] = [];
  for (const m of members) {
    if (!visited.has(m.id)) unsorted.push(m);
  }

  return { sorted, unsorted };
}

function cleanOrphanedRefs(members: FamilyMember[]): {
  cleaned: FamilyMember[];
  orphanCount: number;
  orphanedFatherIds: string[];
} {
  const idSet = new Set(members.map((m) => m.id));
  const orphanedFatherIds: string[] = [];
  let orphanCount = 0;

  const cleaned = members.map((m) => {
    if (m.father_id && !idSet.has(m.father_id)) {
      orphanCount++;
      if (!orphanedFatherIds.includes(m.father_id)) {
        orphanedFatherIds.push(m.father_id);
      }
      return { ...m, father_id: null };
    }
    return { ...m };
  });

  return { cleaned, orphanCount, orphanedFatherIds };
}

async function batchUpsert(
  supabase: ReturnType<typeof createClient>,
  members: FamilyMember[],
  batchSize: number,
  phase: "batch" | "retry"
): Promise<{
  inserted: number;
  failed: FamilyMember[];
  errors: ErrorRecord[];
}> {
  let inserted = 0;
  const failed: FamilyMember[] = [];
  const errors: ErrorRecord[] = [];

  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("family_members")
      .upsert(batch, { onConflict: "id" })
      .select("id");

    if (error) {
      for (const member of batch) {
        const { data: singleData, error: singleError } = await supabase
          .from("family_members")
          .upsert(member, { onConflict: "id" })
          .select("id");
        if (singleError) {
          failed.push(member);
          errors.push({
            id: member.id,
            name: member.name,
            father_id: member.father_id,
            error: singleError.message,
            phase,
          });
        } else {
          inserted += singleData?.length ?? 1;
        }
      }
    } else {
      inserted += data?.length ?? batch.length;
    }
  }

  return { inserted, failed, errors };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const members: FamilyMember[] = familyMembers;
    const total = members.length;

    const originalWithFather = members.filter(
      (m) => m.father_id !== null
    ).length;
    const { cleaned, orphanCount, orphanedFatherIds } =
      cleanOrphanedRefs(members);

    const { sorted, unsorted } = kahnSort(cleaned);

    const insertOrder = [
      ...sorted,
      ...unsorted.map((m) => ({ ...m, father_id: null })),
    ];

    const BATCH_SIZE = 50;
    const pass1 = await batchUpsert(supabase, insertOrder, BATCH_SIZE, "batch");

    let pass2 = {
      inserted: 0,
      failed: [] as FamilyMember[],
      errors: [] as ErrorRecord[],
    };

    if (pass1.failed.length > 0) {
      pass2 = await batchUpsert(supabase, pass1.failed, 1, "retry");
    }

    const totalInserted = pass1.inserted + pass2.inserted;
    const allErrors = [...pass1.errors, ...pass2.errors];

    const finalErrors = allErrors.reduce<ErrorRecord[]>((acc, err) => {
      const existing = acc.findIndex((e) => e.id === err.id);
      if (existing >= 0) {
        if (err.phase === "retry") acc[existing] = err;
      } else {
        acc.push(err);
      }
      return acc;
    }, []);

    const result: SyncResult = {
      success: finalErrors.length === 0,
      total,
      inserted: totalInserted,
      orphans_cleaned: orphanCount,
      errors: finalErrors,
      diagnostics: {
        original_with_father: originalWithFather,
        fathers_outside_set: orphanedFatherIds,
        kahn_sorted_count: sorted.length,
        kahn_unsorted_count: unsorted.length,
        batch_count: Math.ceil(insertOrder.length / BATCH_SIZE),
      },
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: finalErrors.length === 0 ? 200 : 207,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
