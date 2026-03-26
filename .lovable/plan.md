

# Fix Push Notifications — 4 Changes

## Changes

### 1. Replace `npm:web-push` with `jsr:@negrel/webpush` in edge function

**File**: `supabase/functions/send-push-notification/index.ts`

Remove `import webpush from "npm:web-push@3.6.7"` and replace with `ApplicationServer` from `jsr:@negrel/webpush`. Replace `webpush.setVapidDetails()` + `webpush.sendNotification()` with the native Deno-compatible `ApplicationServer.new()` + `subscriber.pushTextMessage()` pattern. Handle expired subscriptions by checking error messages for 410/Gone status.

### 2. Database migration — Fix RLS on `push_subscriptions`

The `upsert` needs both INSERT and UPDATE permissions. Current policy only allows INSERT for anon.

```sql
DROP POLICY IF EXISTS "anon_insert_push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "anon_upsert_push_subscriptions" ON public.push_subscriptions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
```

### 3. Add debug logging to `usePushNotifications.ts`

Add `console.log` statements at key points: subscribe() entry, permission result, subscription creation, DB save result, and auto-subscribe effect trigger.

### 4. Add delayed auto-subscribe trigger

Replace the auto-subscribe `useEffect` with a version that uses a 2-second `setTimeout` to ensure the service worker is ready before attempting subscription. Remove `