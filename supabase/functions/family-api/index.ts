import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Generate a hierarchical member ID matching the project convention */
function generateMemberId(fatherId: string | null, allIds: string[]): string {
  if (!fatherId) {
    const numericIds = allIds.filter((id) => /^\d+$/.test(id)).map(Number);
    return String(Math.max(0, ...numericIds) + 1);
  }
  const prefixMatch = fatherId.match(/^([A-Za-z])/);
  if (prefixMatch) {
    const children = allIds.filter(
      (id) => id.startsWith(fatherId + "_") && !id.slice(fatherId.length + 1).includes("_")
    );
    let nextId = `${fatherId}_${children.length + 1}`;
    while (allIds.includes(nextId)) nextId = `${fatherId}_${children.length + 1}_1`;
    return nextId;
  }
  const numericIds = allIds.filter((id) => /^\d+$/.test(id)).map(Number);
  return String(Math.max(0, ...numericIds) + 1);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

/** Validate admin session token */
async function validateAdminToken(req: Request, supabase: ReturnType<typeof getSupabaseAdmin>): Promise<boolean> {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;

  const { data } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", token)
    .single();

  if (!data || new Date(data.expires_at) < new Date()) return false;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean).pop();
    const supabase = getSupabaseAdmin();

    // ─── VERIFY PASSCODE (public, no auth needed) ───
    if (path === "verify-passcode" && req.method === "POST") {
      const { passcode } = await req.json();
      const correctPasscode = Deno.env.get("FAMILY_PASSCODE");
      if (!correctPasscode || passcode !== correctPasscode) {
        return json({ valid: false });
      }
      return json({ valid: true });
    }

    // ─── MARK REQUEST AS DONE (admin only) ───
    if (path === "mark-done" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }
      const { requestId } = await req.json();
      if (!requestId) return json({ error: "requestId required" }, 400);

      await supabase
        .from("family_requests")
        .update({ status: "completed" })
        .eq("id", requestId);

      return json({ success: true });
    }

    // ─── TRACK VISIT (public) ───
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

    // ─── REGISTER VERIFIED USER (public — from onboarding) ───
    if (path === "register-user" && req.method === "POST") {
      const { memberId, memberName, phone, hijriBirthDate } = await req.json();
      if (!memberId || !memberName || !phone) {
        return json({ error: "memberId, memberName, phone required" }, 400);
      }

      const { data: upserted } = await supabase.from("verified_users").upsert(
        {
          member_id: memberId,
          member_name: memberName,
          phone,
          hijri_birth_date: hijriBirthDate || null,
          verified_at: new Date().toISOString(),
        },
        { onConflict: "member_id" }
      ).select("id").single();

      return json({ success: true, verifiedUserId: upserted?.id || null });
    }

    // ─── GET MY USER ID (public — returns verified_users UUID by phone) ───
    if (path === "get-my-user-id" && req.method === "POST") {
      const { phone } = await req.json();
      if (!phone) return json({ error: "phone required" }, 400);

      const { data: vu } = await supabase
        .from("verified_users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!vu) return json({ error: "Not found" }, 404);
      return json({ verifiedUserId: vu.id });
    }

    // ─── UPDATE MEMBER (auth-gated) ───
    if (path === "update-member" && req.method === "POST") {
      const { id, data: updates, requesterPhone } = await req.json();
      if (!id) return json({ error: "id required" }, 400);

      // Path 1: Admin token
      let isAdmin = false;
      const adminToken = req.headers.get("x-admin-token");
      if (adminToken) {
        isAdmin = await validateAdminToken(req, supabase);
      }

      // Path 2: Verified self
      let isSelf = false;
      if (!isAdmin && requesterPhone) {
        const { data: vu } = await supabase
          .from("verified_users")
          .select("member_id")
          .eq("phone", requesterPhone)
          .single();
        isSelf = vu?.member_id === id;
      }

      if (!isAdmin && !isSelf) {
        return json({ error: "Unauthorized" }, 403);
      }

      // Self-update: restrict allowed fields
      if (isSelf && !isAdmin) {
        const allowed = ["birth_year", "phone"];
        const blocked = Object.keys(updates).filter((k: string) => !allowed.includes(k));
        if (blocked.length > 0) {
          return json({ error: `Cannot update: ${blocked.join(", ")}` }, 403);
        }
      }

      await supabase
        .from("family_members")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      return json({ success: true });
    }

    // ─── ADD MEMBER (admin only) ───
    if (path === "add-member" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }
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

    // ─── GET REQUESTS (admin only) ───
    if (path === "get-requests" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }

      const { data, error } = await supabase
        .from("family_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return json({ error: error.message }, 500);
      return json({ requests: data || [] });
    }

    // ─── GET VERIFIED USERS (admin only) ───
    if (path === "get-verified-users" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }

      const { data, error } = await supabase
        .from("verified_users")
        .select("*");

      if (error) return json({ error: error.message }, 500);
      return json({ users: data || [] });
    }

    // ─── GET VERIFIED MEMBER IDS (public — no PII) ───
    if (path === "get-verified-ids" && req.method === "POST") {
      const { data, error } = await supabase
        .from("verified_users")
        .select("member_id");

      if (error) return json({ error: error.message }, 500);
      return json({ ids: (data || []).map((r: any) => r.member_id) });
    }

    // ─── DELETE MEMBER (admin only) ───
    if (path === "delete-member" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }
      const { memberId } = await req.json();
      if (!memberId) return json({ error: "memberId required" }, 400);

      // Check children
      const { count } = await supabase
        .from("family_members")
        .select("id", { count: "exact", head: true })
        .eq("father_id", memberId);

      if ((count ?? 0) > 0) {
        return json({ error: "يوجد أبناء مسجلون" }, 400);
      }

      const { error: delError } = await supabase
        .from("family_members")
        .delete()
        .eq("id", memberId);

      if (delError) return json({ error: delError.message }, 500);
      return json({ success: true });
    }

    // ─── ARCHIVE MEMBER (admin only) ───
    if (path === "archive-member" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }
      const { memberId } = await req.json();
      if (!memberId) return json({ error: "memberId required" }, 400);

      const { error: archiveError } = await supabase
        .from("family_members")
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq("id", memberId);

      if (archiveError) return json({ error: archiveError.message }, 500);
      return json({ success: true });
    }

    // ─── RESOLVE REQUEST (admin only) ───
    if (path === "resolve-request" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }

      const {
        requestId, decision, type,
        targetMemberId, targetMemberName,
        spouseName, childName, childGender,
        adminNote,
      } = await req.json();

      if (!requestId) return json({ error: "requestId required" }, 400);

      if (decision === "approved") {
        if (type === "add_spouse") {
          const { data: member } = await supabase
            .from("family_members")
            .select("spouses, name")
            .eq("id", targetMemberId)
            .single();

          const current = member?.spouses?.trim() || "";
          const updated = current ? `${current}،${spouseName}` : spouseName;

          await supabase
            .from("family_members")
            .update({ spouses: updated, updated_at: new Date().toISOString() })
            .eq("id", targetMemberId);
        }

        if (type === "add_child") {
          const { data: allIds } = await supabase
            .from("family_members")
            .select("id");

          const ids = (allIds || []).map((r: any) => r.id);
          const newId = generateMemberId(targetMemberId, ids);

          const { data: father } = await supabase
            .from("family_members")
            .select("name")
            .eq("id", targetMemberId)
            .single();

          const fatherName = father?.name || targetMemberName || "";
          const fullName = `${childName} بن ${fatherName}`;

          await supabase.from("family_members").insert({
            id: newId,
            name: fullName,
            gender: childGender || "M",
            father_id: targetMemberId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // type === 'other' — no data change needed
      }

      const newStatus = decision === "approved" ? "approved" : "completed";
      await supabase
        .from("family_requests")
        .update({ status: newStatus, notes: adminNote || null })
        .eq("id", requestId);

      return json({ success: true });
    }

    // ─── DELETE VERIFIED USER (admin only) ───
    if (path === "delete-verified-user" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }
      const { userId } = await req.json();
      if (!userId) return json({ error: "userId required" }, 400);

      const { error: delErr } = await supabase
        .from("verified_users")
        .delete()
        .eq("id", userId);

      if (delErr) return json({ error: delErr.message }, 500);
      return json({ success: true });
    }

    // ─── SEND NOTIFICATION (admin only) ───
    if (path === "send-notification" && req.method === "POST") {
      if (!(await validateAdminToken(req, supabase))) {
        return json({ error: "Unauthorized" }, 401);
      }

      const { title, body, type, user_ids } = await req.json();
      if (!title || !body) return json({ error: "title and body required" }, 400);

      let targetIds = user_ids;
      if (!targetIds || targetIds.length === 0) {
        const { data: allUsers } = await supabase
          .from("verified_users")
          .select("id");
        targetIds = (allUsers || []).map((u: any) => u.id);
      }

      if (targetIds.length === 0) {
        return json({ error: "No users found" }, 400);
      }

      const rows = targetIds.map((uid: string) => ({
        user_id: uid,
        title,
        body,
        type: type || "broadcast",
        is_read: false,
      }));

      const { error: insertErr } = await supabase
        .from("notifications")
        .insert(rows);

      if (insertErr) return json({ error: insertErr.message }, 500);
      return json({ success: true, sent: targetIds.length });
    }

    return json({ error: "Invalid endpoint" }, 400);
  } catch (error) {
    console.error("[family-api] Error:", error);
    return json({ error: error.message || "Internal server error" }, 500);
  }
});
