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

    // ─── APPROVE REQUEST ───
    if (path === "approve" && req.method === "POST") {
      const { requestId } = await req.json();
      if (!requestId) return json({ error: "requestId required" }, 400);

      // Fetch the request
      const { data: reqData, error: fetchErr } = await supabase
        .from("family_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchErr || !reqData) return json({ error: "Request not found" }, 404);
      if (reqData.status !== "pending") return json({ error: "Request already handled" }, 400);

      // Apply the change
      const data = reqData.data as Record<string, string>;
      if (reqData.type === "add_child") {
        await supabase.from("family_members").insert({
          id: `REQ-${requestId.slice(0, 8)}`,
          name: data.childName || "غير محدد",
          gender: data.gender || "M",
          father_id: reqData.target_member_id,
          birth_year: data.birthYear || null,
        });
      } else if (reqData.type === "update_info" || reqData.type === "correction") {
        const updates: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          if (["name", "birth_year", "death_year", "phone", "notes", "spouses"].includes(k)) {
            updates[k] = v;
          }
        }
        if (Object.keys(updates).length > 0) {
          await supabase
            .from("family_members")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", reqData.target_member_id);
        }
      } else if (reqData.type === "add_spouse") {
        const { data: member } = await supabase
          .from("family_members")
          .select("spouses")
          .eq("id", reqData.target_member_id)
          .single();
        const currentSpouses = member?.spouses || "";
        const newSpouse = data.spouseName || "";
        await supabase
          .from("family_members")
          .update({
            spouses: currentSpouses ? `${currentSpouses}، ${newSpouse}` : newSpouse,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reqData.target_member_id);
      }

      // Mark approved
      await supabase
        .from("family_requests")
        .update({ status: "approved" })
        .eq("id", requestId);

      return json({ success: true });
    }

    // ─── REJECT REQUEST ───
    if (path === "reject" && req.method === "POST") {
      const { requestId } = await req.json();
      if (!requestId) return json({ error: "requestId required" }, 400);

      await supabase
        .from("family_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      return json({ success: true });
    }

    // ─── TRACK VISIT ───
    if (path === "track-visit" && req.method === "POST") {
      // Increment visit counter
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
