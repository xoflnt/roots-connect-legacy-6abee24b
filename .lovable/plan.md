

# Realtime Notifications + Global Documenter Badge

## 1. Realtime on `family_requests` for Admin Dashboard

**Database migration**: Enable realtime publication on the `family_requests` table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_requests;
```

**`src/pages/Admin.tsx`**: Add a Supabase Realtime subscription in `AdminContent`:
- Subscribe to `postgres_changes` on `family_requests` (INSERT and UPDATE events)
- On any change, call `loadData()` to refresh the request list and counts
- Show a subtle pulse indicator in the header when a new request arrives
- Clean up subscription on unmount

## 2. Documenter Badge — Missing Locations

The badge currently appears in `FamilyCard.tsx` and `PersonDetails.tsx`. It is **missing** from:

| Component | Where to add |
|---|---|
| `LineageView.tsx` (~line 246) | After the existing heritage badges block, add `{member.id === DOCUMENTER_ID && <HeritageBadge type="documenter" />}` |
| `ListView.tsx` (~line 223-225) | After the member name `<span>`, add a small inline documenter badge |
| `DataTableView.tsx` (~line 205) | In the name `<TableCell>`, append the badge next to the name |

Each location imports `DOCUMENTER_ID` from `branchUtils` and `HeritageBadge`, then conditionally renders when `member.id === DOCUMENTER_ID`.

## Files Changed

| File | Change |
|---|---|
| Migration SQL | `ALTER PUBLICATION supabase_realtime ADD TABLE public.family_requests` |
| `src/pages/Admin.tsx` | Add realtime subscription to auto-refresh on new/updated requests |
| `src/components/LineageView.tsx` | Add documenter badge in timeline cards |
| `src/components/ListView.tsx` | Add documenter badge next to name |
| `src/components/DataTableView.tsx` | Add documenter badge in table name cell |

