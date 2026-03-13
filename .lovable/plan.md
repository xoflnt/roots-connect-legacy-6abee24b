

# Fix: White Screen on All Pages Except Landing

## Root Cause Analysis

After thorough code inspection, there are **two critical issues** causing white screens:

### 1. No React Error Boundary
The app has **zero error boundaries**. Any uncaught error in any component (FamilyTree, PersonPage, KinshipCalculator, etc.) kills React's entire render tree, resulting in a permanent white screen with no recovery path.

### 2. Stale Service Worker Chunks
With `vite-plugin-pwa` and lazy-loaded routes, when the app updates, old cached JS chunks become invalid. When React tries to lazy-load a route (e.g., navigating from landing to tree view), the service worker serves a stale chunk that fails to parse. Without an error boundary, the app crashes to white.

### 3. Double Safe-Area Padding
The body has `padding-top: env(safe-area-inset-top)` AND individual headers also add the same padding. Combined with `h-screen` on page containers, this can cause layout overflow issues on iOS PWA. Not a white screen cause, but needs fixing.

## Fixes

### Fix 1: Add React Error Boundary with Arabic UI
Create `src/components/ErrorBoundary.tsx` — a class component that catches render errors and shows a friendly Arabic error screen with a "reload" button. Wrap the entire app in it in `App.tsx`.

### Fix 2: Add Lazy Import Retry Logic
Wrap all `lazy()` calls with a retry helper that catches chunk load errors (`ChunkLoadError`) and retries with a cache-busted URL. If retry fails, force-reload the page to get fresh chunks.

```typescript
function lazyRetry(factory: () => Promise<any>) {
  return lazy(() => factory().catch(() => {
    // Force reload on chunk load failure
    window.location.reload();
    return factory(); // never resolves, reload happens first
  }));
}
```

### Fix 3: Remove Double Safe-Area Padding
Remove `padding-top/bottom: env(safe-area-inset-*)` from `body` in `index.css`. Keep it only on individual sticky/fixed elements (AppHeader, bottom nav, etc.) where it's already applied. This prevents double-padding and fixes `h-screen` overflow.

### Fix 4: Add `dvh` Height for iOS
Replace `h-screen` (100vh) with `h-[100dvh]` on main page containers. On iOS Safari, `100vh` includes the address bar area, causing content to be cut off. `100dvh` (dynamic viewport height) adapts correctly.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ErrorBoundary.tsx` | **New** — React error boundary with Arabic UI |
| `src/App.tsx` | Wrap in ErrorBoundary; use `lazyRetry` for all lazy imports |
| `src/index.css` | Remove body safe-area padding |
| `src/pages/Index.tsx` | Change `h-screen` to `h-[100dvh]` |
| `src/pages/PersonPage.tsx` | Change `h-screen` to `h-[100dvh]` |

