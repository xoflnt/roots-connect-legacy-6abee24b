

# Add Child Deletion with Confirmation Dialog

## What to build
Add a delete button next to each child in the Profile page, with an AlertDialog confirmation before deletion. The child will be removed from the database by clearing their `father_id` (unlinking from parent), then refreshing the UI.

## Changes

### `src/pages/Profile.tsx`

1. **Import** `AlertDialog` components and add state for pending child deletion (`childToDelete`)
2. **Add delete button** next to each child row (Trash2 icon, same style as spouse delete)
3. **Add AlertDialog** with Arabic confirmation text: "هل أنت متأكد من حذف [name]؟" with "حذف" (destructive) and "إلغاء" buttons
4. **Delete handler**: calls `updateMember(childId, { father_id: null })` to unlink the child, then `refreshMembers()` + dispatch `family-data-updated` event

### Implementation detail
- Unlinking (`father_id = null`) is safer than actual row deletion since the table has no DELETE RLS policy
- State: `childToDelete: FamilyMember | null` controls the dialog open state
- The confirmation dialog uses the existing `AlertDialog` component from `@/components/ui/alert-dialog`

