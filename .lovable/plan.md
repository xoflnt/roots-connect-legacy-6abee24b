

# Switch PWA to injectManifest Strategy for Push Notifications

## Why

The current `importScripts: ['/push-handler.js']` approach in `generateSW` mode is unreliable in production — the generated SW may not correctly import the push handler file. Switching to `injectManifest` gives full control over the service worker, ensuring push and notificationclick events are always registered.

## Changes

### 1. Create `src/sw.ts` — Custom service worker

Contains:
- Workbox `precacheAndRoute(self.__WB_MANIFEST)` and `cleanupOutdatedCaches()`
- `message` listener for `SKIP_WAITING` (needed by `SWUpdateBanner`)
- `push` event handler (moved from `public/push-handler.js`)
- `notificationclick` event handler
- Offline fallback via `setCatchHandler` for navigation requests

### 2. Update `vite.config.ts` — Switch to injectManifest

Replace the `workbox` block with:
```typescript
strategies: 'injectManifest',
srcDir: 'src',
filename: 'sw.ts',
registerType: 'prompt',
injectManifest: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
},
```

Keep the entire `manifest` block unchanged.

### 3. Delete `public/push-handler.js`

No longer needed — logic is now in `src/sw.ts`.

### 4. Update `src/main.tsx` — Register SW with prompt mode

Since `registerType: 'prompt'`, we need to import the virtual module for registration:
```typescript
import { registerSW } from 'virtual:pwa-register';
const updateSW = registerSW({ onNeedRefresh() { /* handled by SWUpdateBanner */ } });
```

## Files

| File | Action |
|------|--------|
| `src/sw.ts` | Create — custom service worker |
| `vite.config.ts` | Update — switch to injectManifest |
| `public/push-handler.js` | Delete |
| `src/main.tsx` | Update — add SW registration |

