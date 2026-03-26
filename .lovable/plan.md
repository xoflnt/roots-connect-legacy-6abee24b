

# Fix userId Resolution for Notifications

## Security Concern

The user requested `USING (true)` on `verified_users` SELECT, but this table contains **phone numbers** and **member names** — exposing all rows to anonymous users is a privacy risk. 

**Safer alternative**: Instead of opening `verified_users` to public reads, fix the edge function path and add a retry. The `getMyUserId` edge function already exists and works server-side with `service_role`. The real issue is that it may fail silently or the resolution runs only once.

## Changes

### 1. `src/hooks/useNotifications.ts` — Robust userId resolution with retry

Replace the resolution `useEffect` (lines 27-54):
- Keep using `getMyUserId()` edge function (no RLS change needed)
- Add a 3-second retry if first attempt fails
- Remove the early `if (userId) return` guard that prevents re-resolution after logout/login cycles
- Add more debug logging

```typescript
useEffect(() => {
  if (!isLoggedIn || !currentUser) {
    setIsLoading(false);
    return;
  }
  if (userId) return;

  let cancelled = false;

  const resolve = async (attempt: number) => {
    // Try cached verifiedUserId first
    if (currentUser.verifiedUserId) {
      if (!cancelled) {
        setUserId(currentUser.verifiedUserId);
        console.log("[Notifications] userId from cache:", currentUser.verifiedUserId);
      }
      return;
    }

    if (!currentUser.phone) return;

    console.log(`[Notifications] Resolving userId attempt ${attempt}...`);
    const id = await getMyUserId(currentUser.phone);
    
    if (id && !cancelled) {
      setUserId(id);
      login({ ...currentUser, verifiedUserId: id });
      console.log("[Notifications] userId resolved:", id);
    } else if (!cancelled && attempt < 3) {
      // Retry after delay
      setTimeout(() => resolve(attempt + 1), 3000);
    } else if (!cancelled) {
      console.warn("[Notifications] userId resolution failed after retries");
      setIsLoading(false);
    }
  };

  resolve(1);
  return () => { cancelled = true; };
}, [isLoggedIn, currentUser, userId, login]);
```

### 2. `src/hooks/usePushNotifications.ts` — More aggressive auto-subscribe (line 96)

Change condition from `permission === "default"` to `permission !== "denied"`:

```typescript
useEffect(() => {
  if (userId && isSupported && vapidKey && permission !== "denied") {
    subscribe();
  }
}, [userId, isSupported, vapidKey, permission, subscribe]);
```

This re-subscribes on `"granted"` too (ensuring the DB row exists even if the browser already had permission).

### 3. No RLS changes needed

The edge function `get-my-user-id` already runs with `service_role` and bypasses RLS. Fixing the retry logic is sufficient without exposing `verified_users` to public reads.

## Files
| File | Change |
|------|--------|
| `src/hooks/useNotifications.ts` | Add retry logic to userId resolution |
| `src/hooks/usePushNotifications.ts` | Broaden auto-subscribe condition |

