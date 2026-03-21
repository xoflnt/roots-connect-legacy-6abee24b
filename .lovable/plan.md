

# Fix update-member Security Vulnerability

## Problem
The `update-member` endpoint in `family-api` has zero authentication — anyone can update any member's data.

## Changes

### 1. Edge Function: `supabase/functions/family-api/index.ts` (lines 132-143)

Replace the current open `update-member` handler with auth-gated logic:

- **Admin path**: Check `x-admin-token` header against `admin_sessions` table
- **Self-update path**: Check `requesterPhone` against `verified_users` to confirm the caller owns the member record
- **Field restriction**: Self-updates limited to `birth_year` only (phone is already stored separately in `verified_users`)
- **Deny** if neither admin nor verified self

### 2. Frontend: `src/services/dataService.ts` (line 70-73)

Update `updateMember()` to automatically include the current user's phone from localStorage:

```ts
export async function updateMember(id: string, data: Partial<FamilyMember>, adminToken?: string): Promise<void> {
  const headers = adminToken ? { "x-admin-token": adminToken } : undefined;
  // Include requester phone for self-auth
  const stored = localStorage.getItem("khunaini-current-user");
  const requesterPhone = stored ? JSON.parse(stored)?.phone : undefined;
  await callFamilyApi("update-member", { id, data, requesterPhone }, headers);
}
```

No changes needed in callers (`OnboardingModal.tsx`, `Profile.tsx`, `AddMemberSheet.tsx`) — they all go through `updateMember()` which will now auto-include the phone. Admin callers already pass `adminToken`.

### 3. Edge function handler detail

```ts
if (path === "update-member" && req.method === "POST") {
  const { id, data: updates, requesterPhone } = await req.json();
  if (!id) return json({ error: "id required" }, 400);

  // Path 1: Admin
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

  // Self-update: restrict fields
  if (isSelf && !isAdmin) {
    const allowed = ["birth_year", "phone"];
    const blocked = Object.keys(updates).filter(k => !allowed.includes(k));
    if (blocked.length > 0) {
      return json({ error: `Cannot update: ${blocked.join(", ")}` }, 403);
    }
  }

  await supabase.from("family_members")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  return json({ success: true });
}
```

## Files Modified
- `supabase/functions/family-api/index.ts` — add auth to update-member
- `src/services/dataService.ts` — include requester phone automatically

