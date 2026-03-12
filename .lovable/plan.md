

# Fix: State Reset Bug — Unsaved Changes Lost on Refresh

## Root Cause

In `Profile.tsx`, there's a `useEffect([member])` (line 62) that reinitializes `editSpouses` from the DB every time `member` changes. When the user:

1. Removes spouses locally (not yet saved)
2. Adds a child → triggers `refreshMembers()` → `setRefreshKey()` → `member` recalculates
3. `useEffect` fires → `editSpouses` resets from DB → deleted spouses reappear

The user sees all their deletions reversed.

## Fix

### `src/pages/Profile.tsx`

1. **Add `spousesDirty` flag** — tracks whether user has unsaved spouse edits
2. **Guard the useEffect** — only reset `editSpouses` from DB when `!spousesDirty`
3. **Set dirty=true** in `handleAddSpouse` and `handleRemoveSpouse`
4. **Set dirty=false** after successful `handleSave`
5. **Auto-save before child operations** — when adding/deleting a child, if `spousesDirty`, save spouse changes first to prevent data loss
6. **Clean up duplicate test data** — remove duplicate REQ-* entries from DB

### Changes detail

```typescript
// New state
const [spousesDirty, setSpousesDirty] = useState(false);

// Guard the useEffect
useEffect(() => {
  if (!member || spousesDirty) return;  // <-- don't overwrite unsaved edits
  setEditSpouses(member.spouses ? ... : []);
  ...
}, [member]);

// Mark dirty on edit
const handleAddSpouse = () => {
  ...
  setSpousesDirty(true);
};
const handleRemoveSpouse = (index: number) => {
  ...
  setSpousesDirty(true);
};

// Clear dirty on save
const handleSave = async () => {
  ...
  setSpousesDirty(false);
};

// Auto-save before child add/delete if dirty
const handleAddChild = async () => {
  if (spousesDirty) await handleSave();
  ...
};
```

### DB Cleanup

Remove duplicate test entries:
```sql
-- Delete orphaned test records
DELETE FROM family_members WHERE id IN ('REQ-ac46f340', 'REQ-355c8f76', 'REQ-a9525a09');
```

## Files Changed

| File | Change |
|---|---|
| `src/pages/Profile.tsx` | Add `spousesDirty` guard to prevent state reset, auto-save before child ops |
| DB migration | Clean up duplicate test data |

