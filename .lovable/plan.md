

# Fix Sync Button Count Display

## Problem
Line 198 displays `data.inserted` (410) instead of the actual static member count (475). The edge function's `inserted` count reflects only successful DB upserts, not total members sent.

## Root Cause
The `seed-family-data` edge function processes members in batches and skips failures (e.g., FK constraint violations from ordering issues). Its response `inserted` count < total sent.

There are **two issues** to fix:

### Fix 1: Show correct count in Admin.tsx (line 198)
Change the success message to always use the local array length:
```ts
setSyncResult(`تمت المزامنة: ${members.length} فرد`);
```
This shows how many were **sent**, not how many succeeded silently.

Better yet, show both for transparency:
```ts
const inserted = (data as any)?.inserted ?? members.length;
const total = members.length;
if (inserted < total) {
  setSyncResult(`تمت المزامنة: ${inserted} من ${total} فرد`);
} else {
  setSyncResult(`تمت المزامنة: ${total} فرد`);
}
```

### Fix 2 (optional but recommended): Fix the edge function ordering
The 65-member gap likely comes from FK constraint failures in `seed-family-data`. The topological sort may have bugs. This is a separate task.

## Files Changed
- `src/pages/Admin.tsx` — line 198 only

