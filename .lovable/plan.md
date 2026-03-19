

# Fix Full Name on Save & Refresh After Add

## Files to Modify (3)

### 1. `src/components/admin/members/AddMemberSheet.tsx` (line 180)
Change `name: name.trim()` to construct the full lineage name:
```
name: selectedFather && !noFather ? `${name.trim()} بن ${selectedFather.name}` : name.trim(),
```

### 2. `src/hooks/admin/useMembers.ts`
- Add `refreshKey` state (line 36 area)
- Add `refreshKey` to useEffect dependency array (line 38)
- Add `refreshMembers()` call inside useEffect before `getAllMembers()` to reload cloud data
- Export `refresh: () => setRefreshKey(k => k + 1)` in return object

### 3. `src/components/admin/members/MemberListPage.tsx`
- Destructure `refresh` from `useMembers()` (line 24)
- Update `handleAddSuccess` to call `refresh()` and show toast

