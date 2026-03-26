

# Add Web Push Notification Support

## Overview

Enable native push notifications so users receive alerts even when the app is closed. This requires VAPID keys, a push subscription flow on the client, service worker push event handling, and a new edge function to send push messages.

## Architecture

```text
┌─────────────┐    subscribe    ┌──────────────┐
│  Browser SW  │ ──────────────→│ push_subscriptions │
│  (push event)│                │   (Supabase table) │
└──────┬───────┘                └──────────────┘
       ▲                               │
       │  Web Push API                 │ query
       │                               ▼
┌──────┴───────┐              ┌──────────────────┐
│  Push Service │ ◀───────────│ send-push-notification │
│  (Google/Apple)│   web-push  │   (Edge Function)      │
└──────────────┘              └──────────────────┘
```

## Prerequisites — VAPID Keys

Web Push requires a VAPID key pair. A new edge function will generate them, or the user can provide existing ones. Two secrets are needed:

- `VAPID_PUBLIC_KEY` — shared with the client (stored in code as env var)
- `VAPID_PRIVATE_KEY` — used server-side only (secret)

Since no VAPID keys exist, I will create a utility edge function `generate-vapid-keys` that generates and returns a key pair. The user runs it once, then we store the keys as secrets.

**Alternative (simpler)**: Generate VAPID keys during the plan approval step using an online tool, then ask the user to add them via `add_secret`. This avoids an extra edge function.

I will use the `add_secret` approach — ask the user to generate VAPID keys and add them.

## Changes

### 1. Secrets: `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`

Use `add_secret` to request the user to provide VAPID keys. They can generate them at https://vapidkeys.com or via `npx web-push generate-vapid-keys`.

### 2. Create edge function: `supabase/functions/send-push-notification/index.ts`

- Accepts `{ user_ids: string[], title: string, body: string, url?: string }`
- Queries `push_subscriptions` for matching `user_id`s
- Sends Web Push via the `web-push` npm library (using `npm:web-push` Deno specifier)
- Deletes expired/invalid subscriptions (410 Gone responses)
- Called from `family-api/send-notification` after inserting DB notifications

### 3. Update `supabase/functions/family-api/index.ts`

In the `send-notification` action (line 387-422), after inserting notifications into the DB, invoke the `send-push-notification` edge function to deliver push messages to subscribed devices.

### 4. Add RLS policy on `push_subscriptions`

Currently only `service_role` can access. Add an `INSERT` policy for `anon`/`authenticated` so the client can register subscriptions:

```sql
CREATE POLICY "anon_insert_push_subscriptions"
  ON public.push_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### 5. Create `src/hooks/usePushNotifications.ts`

Client-side hook that:
- Checks `'PushManager' in window` and `'serviceWorker' in navigator`
- On mount (if userId is available), calls `Notification.requestPermission()`
- If granted, gets the service worker registration, calls `registration.pushManager.subscribe()` with the VAPID public key
- Upserts the subscription (`endpoint`, `p256dh`, `auth`) into `push_subscriptions` via Supabase client SDK (allowed by new RLS policy)
- Handles permission denied gracefully
- Exposes `{ isSupported, permission, subscribe }` 

### 6. Update `src/hooks/useNotifications.ts`

Import and call `usePushNotifications` inside `useNotifications`, passing the resolved `userId`. This triggers permission request and subscription registration automatically when the user is logged in.

### 7. Add push event handler to service worker

In `vite.config.ts`, add a custom service worker file via VitePWA's `injectManifest` or add push handling via workbox. Since we use `registerType: "autoUpdate"` with workbox, we need to add a custom SW snippet.

**Approach**: Use VitePWA's `workbox.importScripts` to load a custom push handler script, or switch to `injectManifest` mode.

Simpler approach: Add a `public/push-sw.js` file that handles `push` and `notificationclick` events, and register it separately alongside the PWA SW. However, this creates two SWs which is problematic.

**Best approach**: Use VitePWA's `strategies: 'injectManifest'` with a custom `src/sw.ts` that imports workbox precaching AND handles push events. This is a bigger change to the PWA config.

**Simplest viable approach**: Keep `registerType: "autoUpdate"` and use the `workbox.additionalManifestEntries` + a separate listener. Actually, we can use the `customSwDest` option or simply inject push handling via a small script that the existing SW imports.

I will use `workbox.importScripts: ['/push-handler.js']` in the VitePWA config, and create `public/push-handler.js` with push + notificationclick handlers. This is the least disruptive approach.

### 8. Create `public/push-handler.js`

```javascript
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'إشعار جديد', {
      body: data.body || '',
      icon: '/pwa/icon-192x192.png',
      badge: '/pwa/icon-96x96.png',
      dir: 'rtl',
      lang: 'ar',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
```

## Files Summary

| File | Action |
|------|--------|
| Secrets | Add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| Migration SQL | Add INSERT RLS on `push_subscriptions` |
| `supabase/functions/send-push-notification/index.ts` | Create — Web Push sender |
| `supabase/functions/family-api/index.ts` | Update — call push after DB insert |
| `src/hooks/usePushNotifications.ts` | Create — permission + subscription |
| `src/hooks/useNotifications.ts` | Update — integrate push hook |
| `public/push-handler.js` | Create — SW push event handler |
| `vite.config.ts` | Add `importScripts: ['/push-handler.js']` |

## Execution Order

1. Request VAPID secrets from user (must complete before proceeding)
2. Database migration (RLS policy)
3. Create `send-push-notification` edge function
4. Update `family-api` to call push function
5. Create `public/push-handler.js`
6. Update `vite.config.ts` workbox config
7. Create `usePushNotifications.ts` hook
8. Update `useNotifications.ts` to integrate push

