

# Refactor Profile.tsx → Read-Only Digital ID Card

## Overview
Strip all inline mutation UI (add/delete spouses, add/delete children). Replace with a clean read-only card showing family data, with only 3 directly editable fields: phone, own birth year, and unverified children's birth years. Add a "Request a Change" button that opens the existing `SubmitRequestForm`.

## Changes to `src/pages/Profile.tsx` (complete rewrite)

### Remove
- All spouse editing state/logic (`editSpouses`, `newSpouse`, `spousesDirty`, `handleAddSpouse`, `handleRemoveSpouse`)
- All child add/delete state/logic (`showAddChild`, `newChildName`, `newChildGender`, `newChildMother`, `customMother`, `childToDelete`, `handleAddChild`, `handleDeleteChild`, `resolvedMother`)
- `AlertDialog` for child deletion
- Imports: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `Plus`, `Trash2`, `AlertDialog*`, `addMember`

### Add
- Import `getVerifiedMemberIds` from `dataService`, `submitRequest` from `dataService`
- Import `inferMotherName` from `familyService`, `getBranch`, `getBranchStyle` from `branchUtils`
- Import `SubmitRequestForm` component
- State: `phone` (editable input), `birthDate` (HijriDatePicker), `childBirthYears: Record<string, {day?,month?,year?}>` for unverified children
- State: `requestOpen` for the SubmitRequestForm dialog

### New sections in order

1. **User Card** (read-only): Name, gender badge, age, branch badge, phone (editable Input), descendant count
2. **Birth Date** (editable): HijriDatePicker for own birth year
3. **Family Info** (read-only cards):
   - Father: name (from `member.father_id` → `getMemberById`)
   - Mother: from `inferMotherName(member)`
   - Spouses: displayed as read-only badges
4. **Children Section**: List children with:
   - If child's `member_id` is in `getVerifiedMemberIds()` → read-only birth year + green "تم توثيق البيانات بواسطة [name] ✅" badge
   - If NOT verified → HijriDatePicker to edit child's birth year
5. **Lineage Chain** (read-only, keep existing)
6. **Save Button**: Updates `phone`, own `birth_year`, and each modified unverified child's `birth_year` via `updateMember()`
7. **Request Change Button**: "هل تود إضافة فرد جديد أو تعديل بيانات أخرى؟" → opens `SubmitRequestForm` (already built, reuse it with `targetMember={member}`)
8. **View in tree + Logout** buttons (keep)

### Save logic
```typescript
const handleSave = async () => {
  // 1. Update own phone + birth_year
  await updateMember(member.id, { phone, birth_year: dateStr });
  // 2. Update each dirty unverified child's birth_year
  for (const [childId, date] of Object.entries(childBirthYears)) {
    if (!verifiedIds.has(childId)) {
      await updateMember(childId, { birth_year: formatDate(date) });
    }
  }
  // 3. Update auth context with new phone/date
  login({ ...currentUser, phone, hijriBirthDate: dateStr });
  // 4. Refresh
  await refreshMembers();
  window.dispatchEvent(new Event("family-data-updated"));
};
```

## Files
| File | Change |
|---|---|
| `src/pages/Profile.tsx` | Complete rewrite as described above |

