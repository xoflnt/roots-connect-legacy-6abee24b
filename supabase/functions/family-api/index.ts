import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    const supabase = getSupabaseAdmin();

    // ─── MARK REQUEST AS DONE ───
    if (path === "mark-done" && req.method === "POST") {
      const { requestId } = await req.json();
      if (!requestId) return json({ error: "requestId required" }, 400);

      await supabase
        .from("family_requests")
        .update({ status: "completed" })
        .eq("id", requestId);

      return json({ success: true });
    }

    // ─── TRACK VISIT ───
    if (path === "track-visit" && req.method === "POST") {
      const { data: current } = await supabase
        .from("visit_stats")
        .select("count")
        .eq("id", 1)
        .single();

      const newCount = (current?.count || 0) + 1;
      await supabase
        .from("visit_stats")
        .update({ count: newCount })
        .eq("id", 1);

      return json({ count: newCount });
    }

    // ─── REGISTER VERIFIED USER ───
    if (path === "register-user" && req.method === "POST") {
      const { memberId, memberName, phone, hijriBirthDate } = await req.json();
      if (!memberId || !memberName || !phone) {
        return json({ error: "memberId, memberName, phone required" }, 400);
      }

      await supabase.from("verified_users").upsert(
        {
          member_id: memberId,
          member_name: memberName,
          phone,
          hijri_birth_date: hijriBirthDate || null,
          verified_at: new Date().toISOString(),
        },
        { onConflict: "member_id" }
      );

      return json({ success: true });
    }

    // ─── UPDATE MEMBER ───
    if (path === "update-member" && req.method === "POST") {
      const { id, data: updates } = await req.json();
      if (!id) return json({ error: "id required" }, 400);

      await supabase
        .from("family_members")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      return json({ success: true });
    }

    // ─── ADD MEMBER ───
    if (path === "add-member" && req.method === "POST") {
      const { member } = await req.json();
      if (!member?.id || !member?.name || !member?.gender) {
        return json({ error: "member with id, name, gender required" }, 400);
      }

      await supabase.from("family_members").insert({
        id: member.id,
        name: member.name,
        gender: member.gender,
        father_id: member.father_id || null,
        birth_year: member.birth_year || null,
        death_year: member.death_year || null,
        spouses: member.spouses || null,
        phone: member.phone || null,
        notes: member.notes || null,
      });

      return json({ success: true });
    }

    return json({ error: "Invalid endpoint" }, 400);
  } catch (error) {
    console.error("[family-api] Error:", error);
    return json({ error: error.message || "Internal server error" }, 500);
  }
});
