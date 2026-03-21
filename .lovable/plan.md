

# Build Admin Users Section

## Overview
Create the "المستخدمون الموثّقون" (Verified Users) section in the admin panel. Since `verified_users` table has RLS blocking all client access, all operations go through the `family-api` edge function.

## Changes

### 1. Edge Function: add delete endpoint
**File: `supabase/functions/family-api/index.ts`**

Add a new `delete-verified-user` handler (admin-only) before the final `return json({ error: "Invalid endpoint" })`:

```ts
if (path === "delete-verified-user" && req.method === "POST") {
  if (!(await validateAdminToken(req, supabase))) return json({ error: "Unauthorized" }, 401);
  const { userId } = await req.json();
  if (!userId) return json({ error: "userId required" }, 400);
  await supabase.from("verified_users").delete().eq("id", userId);
  return json({ success: true });
}
```

### 2. Hook: `src/hooks/admin/useUsers.ts`

Fetch users via `getVerifiedUsers(adminToken)` from `dataService.ts`. Provides:
- `users` (filtered by search on name/phone)
- `total` count
- `isLoading`, `search`, `setSearch`
- `deleteUser(userId)` — calls edge function `delete-verified-user`
- `refetch()`

### 3. Component: `src/components/admin/users/UserCard.tsx`

Card row (matches `MemberCard` pattern):
- Right side: member name (bold), phone (muted), hijri birth date if present
- Left side: relative time via `relativeArabicTime`, three-dot menu with "حذف التوثيق" option
- Delete triggers `ConfirmDialog` with warning text
- min-h-16, dir="rtl"

### 4. Page: `src/components/admin/users/UsersPage.tsx`

Layout:
- Header: "المستخدمون الموثّقون" + Badge with total (Arabic numerals)
- Search input: placeholder "ابحث بالاسم أو رقم الجوال..."
- Loading state: Skeleton cards
- Empty state: "لا يوجد مستخدمون مسجّلون بعد"
- List of `UserCard` components

### 5. Wire up: `src/pages/Admin.tsx`

Add import and route: `{section === 'users' && <UsersPage />}`

### 6. Unhide in nav: `AdminSidebar.tsx` + `AdminBottomBar.tsx`

Re-enable the `users` nav item only (keep other 4 hidden).

## Files
- **Create**: `src/hooks/admin/useUsers.ts`, `src/components/admin/users/UsersPage.tsx`, `src/components/admin/users/UserCard.tsx`
- **Modify**: `supabase/functions/family-api/index.ts`, `src/pages/Admin.tsx`, `src/components/admin/AdminSidebar.tsx`, `src/components/admin/AdminBottomBar.tsx`

