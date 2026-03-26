

# Clear push_subscriptions Table

## Problem
Need to delete all existing push subscriptions so users re-subscribe with the new injectManifest service worker.

## Approach
Run a migration with `TRUNCATE` on the `push_subscriptions` table. This is a schema-level operation that clears all rows efficiently.

```sql
TRUNCATE TABLE public.push_subscriptions;
```

## What happens next
- All 3 existing subscription rows are removed
- On next app open, `usePushNotifications` will detect no existing subscription and create a new one registered under the new service worker
- The new `src/sw.ts` (injectManifest) will handle push events directly

## Files
No code changes needed — migration only.

