

# Phase 2C: Edit Member + Delete

## Overview
Add edit mode to AddMemberSheet, create an ArchiveDeleteDialog with countdown-protected delete, add `delete-member` endpoint to the edge function, and wire everything up in MemberDetailSheet.

## Files to Create (1)

### `src/components/admin/members/ArchiveDeleteDialog.tsx`
- Dialog with two sections: Archive (disabled placeholder) and Delete
- Archive section: amber-bordered card with "coming soon" badge, disabled button
- Delete section: red-bordered card
  - If member has children → show count, disable delete button
  - If no children → 5-second countdown button pattern
  - On countdown complete → call `supabase.functions.invoke("family-api/delete-member", ...)` with admin token header
  - On success → toast + `onSuccess()` + close
- Props: `member, allMembers, isOpen, onClose, onSuccess`
- All numbers via `toArabicNum()`, min tap 48px, RTL

## Files to Modify (4)

### 1. `supabase/functions/family-api/index.ts`
Add `delete-member` route (before the final `return json({ error: "Invalid endpoint" })`) :
- Validate admin token
- Extract `memberId` from body
- Check children count via `.select('id', { count: 'exact', head: true }).eq('father_id', memberId)`
- If children > 0 → return 400
- Delete from `family_members` where `id = memberId`
- Return `{ success: true }`

### 2. `src/components/admin/members/AddMemberSheet.tsx`
- Add optional `editMember?: EnrichedMember` prop
- Add `useEffect` to pre-fill form when `editMember` changes:
  - Extract first name via regex split on `بن/بنت`
  - Pre-select father, gender, birth/death dates, spouses, mother from notes, clean notes
- Title changes to "تعديل بيانات العضو" in edit mode
- Show read-only ID badge in edit mode
- Hide father/ID generation fields in edit mode (ID is fixed)
- On save in edit mode: call `updateMember(editMember.id, updates)` with admin token header instead of `addMember()`
  - Reconstruct full name: replace first-name portion, keep lineage suffix
- Confirm dialog title/text adjusted for edit mode
- `onSuccess` prop signature stays the same (pass the updated member)

### 3. `src/components/admin/members/MemberDetailSheet.tsx`
- Add `refresh` prop to interface
- Add `editOpen` and `deleteOpen` state
- Enable "تعديل" button → opens AddMemberSheet in edit mode
- Change "أرشفة" button → opens ArchiveDeleteDialog
- Render both AddMemberSheet (edit) and ArchiveDeleteDialog
- On edit success: close edit sheet, refresh
- On delete success: close dialog, close detail sheet, refresh

### 4. `src/components/admin/members/MemberListPage.tsx`
- Pass `refresh` prop to `MemberDetailSheet`

### 5. `src/services/dataService.ts`
- Update `updateMember` to accept optional admin token and pass it as header (currently calls edge function without auth header — needed for admin edits)

## Technical Details

- The `update-member` edge function endpoint already exists and accepts `{ id, data: updates }` — no edge function change needed for edit, only for delete
- `callFamilyApi` already supports custom headers — `updateMember` just needs to forward an admin token
- The countdown pattern: `useState(5)` + `useEffect` with `setInterval` when counting starts, clears at 0

