

# Fix Push Handler in src/sw.ts

## Changes

### 1. `src/sw.ts` — Replace push event listener

Replace the current `push` listener (lines 28–40) with the user's exact code that adds:
- `async` IIFE inside `waitUntil` for proper error handling
- `try/catch` so a malformed payload still shows a fallback notification
- Default body text `'لديك تحديث جديد'`

### 2. Database migration — Clear push_subscriptions

```sql
DELETE FROM push_subscriptions;
```

Forces re-subscription with the updated service worker.

