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

      const { data: reqData, error: fetchErr } = await supabase
        .from("family_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchErr || !reqData) return json({ error: "Request not found" }, 404);
      if (reqData.status !== "pending") return json({ error: "Request already handled" }, 400);

      // Mark approved FIRST to prevent double-execution
      const { error: updateErr } = await supabase
        .from("family_requests")
        .update({ status: "approved" })
        .eq("id", requestId)
        .eq("status", "pending");

      if (updateErr) return json({ error: "Failed to update status" }, 500);

      const data = reqData.data as Record<string, string>;

      if (reqData.type === "add_child") {
        const childName = data.childName || data.child_name || "غير محدد";
        const gender = data.gender || data.child_gender || "M";
        const motherName = data.motherName || data.mother_name || "";
        const birthYear = data.birthYear || data.birth_year || null;
        const notes = motherName
          ? `${gender === "F" ? "والدتها" : "والدته"}: ${motherName}`
          : null;

        // Dedupe: check if child with same name+gender+father already exists
        const { data: existing } = await supabase
          .from("family_members")
          .select("id")
          .eq("father_id", reqData.target_member_id)
          .eq("name", childName)
          .eq("gender", gender)
          .limit(1);

        if (existing && existing.length > 0) {
          return json({ success: true, note: "Child already exists, skipped insert" });
        }

        await supabase.from("family_members").insert({
          id: `REQ-${requestId.slice(0, 8)}`,
          name: childName,
          gender: gender,
          father_id: reqData.target_member_id,
          birth_year: birthYear,
          notes: notes,
        });
      } else if (reqData.type === "update_info" || reqData.type === "correction") {
        const updates: Record<string, string> = {};
        const keyMap: Record<string, string> = {
          birthYear: "birth_year",
          birth_year: "birth_year",
          deathYear: "death_year",
          death_year: "death_year",
          name: "name",
          phone: "phone",
          notes: "notes",
          spouses: "spouses",
        };
        for (const [k, v] of Object.entries(data)) {
          const dbCol = keyMap[k];
          if (dbCol) {
            updates[dbCol] = v;
          }
        }
        if (Object.keys(updates).length > 0) {
          await supabase
            .from("family_members")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", reqData.target_member_id);
        }
      } else if (reqData.type === "add_spouse") {
        const newSpouse = (data.spouseName || data.spouse_name || "").trim();
        if (newSpouse) {
          const { data: member } = await supabase
            .from("family_members")
            .select("spouses")
            .eq("id", reqData.target_member_id)
            .single();

          const currentSpouses = member?.spouses || "";
          // Dedupe: check if spouse name already in list
          const spouseList = currentSpouses
            ? currentSpouses.split("،").map((s: string) => s.trim()).filter(Boolean)
            : [];

          if (!spouseList.includes(newSpouse)) {
            spouseList.push(newSpouse);
            await supabase
              .from("family_members")
              .update({
                spouses: spouseList.join("، "),
                updated_at: new Date().toISOString(),
              })
              .eq("id", reqData.target_member_id);
          }
        }
      }

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
