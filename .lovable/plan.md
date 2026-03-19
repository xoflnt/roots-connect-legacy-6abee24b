

# Phase 2B: Add Member Form

## Summary
Add a form sheet for creating new family members, with father search, auto-generated IDs, Hijri year validation, and confirmation dialog. Integrates with the existing `addMember()` service and `add-member` edge function.

## Files to Create (4)

### 1. `src/utils/idGenerator.ts`
- `generateMemberId(fatherId, allIds)`: If father has letter prefix, appends `_N` suffix. If numeric, increments max numeric ID.
- `ensureUniqueId(candidateId, allIds)`: Collision-safe wrapper.

### 2. `src/utils/hijriUtils.ts`
- `toWesternNumerals(text)` / `toEasternNumerals(n)`: Convert between ٠-٩ and 0-9.
- `isValidHijriYear(text)`: Range check 1300-1500.
- `hijriToGregorian(hijriText)`: Approximate conversion formula.

### 3. `src/components/admin/members/AddMemberSheet.tsx`
Sheet (bottom mobile, side desktop). Props: `isOpen`, `onClose`, `onSuccess`, `allMembers`, `preselectedFatherId?`.

Form fields (RTL, min-h-12 inputs):
1. **الاسم** — required text, min 2 chars
2. **الأب** — Popover+Command combobox filtering males from `allMembers` via `arabicMatch`. Shows lineage + children count. Selecting auto-generates ID, shows branch/generation preview.
3. **الجنس** — two toggle buttons (M/F), 48px height
4. **سنة الميلاد** — optional, auto-converts to Eastern Arabic, shows Gregorian equivalent, validated with `isValidHijriYear`
5. **الحالة** — toggle (alive/deceased), shows death year field when deceased
6. **الزوجات** — dynamic list (max 4), add/remove buttons, label adapts to gender
7. **ملاحظات** — textarea, 500 char limit with counter

Auto-generated preview box showing ID, branch, generation, lineage chain.

Save button calls `addMember(member, adminToken)` from dataService after ConfirmDialog approval. Uses `getAdminToken()` for auth header.

### 4. `src/components/admin/shared/ConfirmDialog.tsx`
AlertDialog wrapper. Props: `isOpen`, `onClose`, `onConfirm`, `title`, `children`, `confirmText`, `cancelText`, `variant` (default/danger). Min-h-12 buttons.

## Files to Modify (1)

### 5. `src/components/admin/members/MemberListPage.tsx`
- Add `addOpen` state
- Mobile: FAB (fixed, bottom-20 left-4, Plus icon, min-w-14 min-h-14)
- Desktop: "+ إضافة عضو" button in header
- Both open `AddMemberSheet`
- On success: toast + trigger member list refresh

## Technical Notes
- Edge function payload: `{ member: { id, name, gender, father_id, birth_year, death_year, spouses, phone, notes } }` with `x-admin-token` header — already handled by `addMember()` in dataService
- `toArabicNum` from arabicUtils used for display; `toEasternNumerals` from hijriUtils for form conversion (same logic, kept in hijriUtils for co-location with validation)
- Father combobox uses Popover + Command from shadcn (already in project)
- All RTL, 16px min font, 48px min tap

