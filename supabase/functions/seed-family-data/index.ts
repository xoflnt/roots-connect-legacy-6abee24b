import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const members = body.members;

    if (!Array.isArray(members) || members.length === 0) {
      return new Response(
        JSON.stringify({ error: "members array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // We need to insert in order respecting foreign keys (father_id).
    // Sort: members without father_id first, then by depth.
    // Topological sort: parents before children
    function topoSort(members: any[]): any[] {
      const idSet = new Set(members.map((m: any) => m.id));
      const sorted: any[] = [];
      const visited = new Set<string>();

      function visit(member: any) {
        if (visited.has(member.id)) return;
        if (member.father_id && idSet.has(member.father_id)) {
          const father = members.find((m: any) => m.id === member.father_id);
          if (father) visit(father);
        }
        visited.add(member.id);
        sorted.push(member);
      }

      members.forEach((m: any) => visit(m));
      return sorted;
    }

    const ordered = topoSort(members);

    // Insert one-by-one to guarantee FK parent exists before child
    let insertedCount = 0;
    const errors: string[] = [];

    for (const m of ordered) {
      const row = {
        id: m.id,
        name: m.name,
        gender: m.gender,
        father_id: m.father_id || null,
        birth_year: m.birth_year || null,
        death_year: m.death_year || m.Death_year || null,
        spouses: m.spouses || null,
        phone: m.phone || null,
        notes: m.notes || null,
      };

      const { error } = await supabase
        .from("family_members")
        .upsert(row, { onConflict: "id" });

      if (error) {
        errors.push(`${m.id}: ${error.message}`);
      } else {
        insertedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        inserted: insertedCount,
        total: ordered.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[seed-family-data] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
