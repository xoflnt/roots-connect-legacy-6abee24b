

# Fix userId Resolution in useNotifications

## Problem
The `resolvedRef` guard prevents retries if `getMyUserId()` fails or returns null. userId stays null forever, so no realtime subscription is created.

## Important constraint
The `verified_users` table has RLS blocking all client SELECT (`block_all_select_verified_users` → `false`). A direct `supabase.from('verified_users').select(...)` from the client **will fail**. Must keep using the `getMyUserId()` edge function call.

## Changes

### 1. `src/hooks/useNotifications.ts`

Replace the resolution logic:
- Remove `resolvedRef`
- Remove `useRef` import
- Initialize `userId` from `currentUser?.verifiedUserId` (already done)
- New resolution effect: if `isLoggedIn` and `currentUser?.phone` exists but `userId` is null, call `getMyUserId(currentUser.phone)` via edge function. On success, set userId and persist via `login()`. On failure, just set `isLoading(false)` — no ref blocking retries (the effect will re-run if `currentUser` changes).
- Add `console.log('[Notifications] userId resolved:', userId)` after resolution

```typescript
useEffect(() => {
  if (!isLoggedIn || !currentUser) {
    setIsLoading(false);
    return;
  }
  if (userId) return; // already resolved

  const resolve = async () => {
    // Try localStorage first
    if (currentUser.verifiedUserId) {
      setUserId(currentUser.verifiedUserId);
      return;
    }
    // Resolve via edge function
    if (currentUser.phone) {
      const id = await getMyUserId(currentUser.phone);
      if (id) {
        setUserId(id);
        login({ ...currentUser, verifiedUserId: id });
        console.log('[Notifications] userId resolved:', id);
      } else {
        console.log('[Notifications] userId resolution failed');
        setIsLoading(false);
      }
    }
  };
  resolve();
}, [isLoggedIn, currentUser, userId, login]);
```

### 2. `src/components/NotificationBell.tsx`

No changes needed — it already calls `useNotifications()` with no props and doesn't accept a userId prop.

### Files modified
- `src/hooks/useNotifications.ts` — remove resolvedRef, fix resolution logic, add debug logging

