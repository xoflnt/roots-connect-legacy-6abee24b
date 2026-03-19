

# Phase 3: Enhanced Edit Requests

## Overview
Build a full admin requests management system: hook, page with tabs, request cards, detail sheet with approve/reject actions, and a `resolve-request` edge function endpoint that applies approved changes to the database.

## Files to Create

### 1. `src/hooks/admin/useRequests.ts`
- Hook that fetches requests via edge function `get-requests` with admin token
- Enriches each request with `target_member_name` from `getAllMembers()`
- State: `requests`, `activeTab` (pending/done/all), `isLoading`
- `filtered` memo based on activeTab
- Exposes `refetch` callback

### 2. `src/components/admin/requests/RequestsPage.tsx`
- Uses `useRequests()` hook
- Header "الطلبات" with pending count badge
- Three tabs: "بانتظار المراجعة (n)" | "تمت المعالجة" | "الكل"
- Renders list of `RequestCard` components
- Empty state per tab
- Manages `selectedRequest` state to open `RequestDetailSheet`

### 3. `src/components/admin/requests/RequestCard.tsx`
- Renders differently per `request.type`: add_child (UserPlus green), add_spouse (Heart pink), other (MessageSquare blue)
- Shows target member name, submitted_by, relative Arabic time
- Status badge: pending=amber, approved=green, completed=gray
- Pending cards show "عرض التفاصيل" button → opens detail sheet
- Uses `toArabicNum` for any numbers

### 4. `src/components/admin/requests/RequestDetailSheet.tsx`
- Sheet (bottom on mobile, side on desktop)
- Full request details based on type
- For add_child/add_spouse: editable input to modify name before approving
- Action buttons: "قبول وتطبيق" (green) and "رفض" (red outline), both min-h-12
- On approve: calls `family-api/resolve-request` with type-specific payload
- On reject: calls `family-api/mark-done` to mark as completed
- Shows loading spinner during action

## Files to Modify

### 5. `supabase/functions/family-api/index.ts`
Add `resolve-request` endpoint (admin-only):

- Reads `requestId, decision, type, targetMemberId, targetMemberName, spouseName, childName, childGender`
- If decision === 'approved':
  - **add_spouse**: fetch current member's `spouses`, append new name with Arabic comma separator, update via upsert
  - **add_child**: fetch all IDs, generate new ID using same logic as `idGenerator.ts` (inline helper), build full name as `childName بن fatherName`, insert new member
  - **other**: no data change
- Update request status to 'approved' or 'completed'
- Return `{ success: true }`

ID generation helper (inline in edge function):
```text
function generateId(fatherId, allIds):
  if fatherId has letter prefix:
    count direct children (fatherId_N pattern)
    return fatherId_(count+1)
  else:
    find max numeric ID
    return max+1
```

### 6. `src/pages/Admin.tsx`
- Import `RequestsPage`
- Replace the catch-all placeholder with explicit `{section === 'requests' && <RequestsPage />}`
- Keep catch-all for remaining sections

## Technical Details

- RLS blocks direct SELECT on `family_requests` for anon/authenticated, so requests are fetched via the existing `get-requests` edge function endpoint (service role)
- The `resolve-request` endpoint uses service role to both read and write `family_members` and `family_requests`
- Arabic relative time: compute diff from `created_at`, output "منذ دقائق" / "منذ ساعة" / "منذ X أيام" etc.
- All UI is RTL, min font 16px, min tap target 48px
- Eastern Arabic numerals throughout via `toArabicNum`

