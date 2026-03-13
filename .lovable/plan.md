

# Comprehensive PWA Audit & UX Fix

## Issues Found

### 1. Manifest Icons — Missing sizes
Only 192 and 512 exist. Need 48, 72, 96, 128, 144, 152, 384 for full compatibility. Also need a dedicated maskable icon entry separate from the any-purpose one.

### 2. iOS Apple Touch Icons — Missing sizes
Only one generic `apple-touch-icon` link. Need sized variants: 120, 152, 167, 180.

### 3. iOS Splash Screens
No `apple-touch-startup-image` links for iPhone splash screens.

### 4. Font Loading
Google Fonts URL lacks `&display=swap`. Currently loads with default `display` which blocks rendering.

### 5. Service Worker Config
- No runtime caching strategies for API calls (network-first) vs assets (cache-first)
- No offline fallback page
- Auth routes excluded via `navigateFallbackDenylist` (good), but Supabase API calls should use network-first

### 6. Viewport Meta
Missing `viewport-fit=cover` for notched iPhones when using `black-translucent` status bar.

### 7. Mobile Search Keyboard UX
The mobile search dialog uses a full-screen `Dialog` which already handles keyboard well (flexbox column with `flex-1 overflow-y-auto` for results). However, it doesn't use `visualViewport` API to dynamically resize when the iOS keyboard opens, which can cause results to hide behind the keyboard on Safari.

### 8. Lazy Loading
`Index` and `PersonPage` are not lazy-loaded. Only Admin, Profile, Guide are.

## Plan

| File | Changes |
|------|---------|
| `vite.config.ts` | Add all icon sizes to manifest; add runtime caching for network-first API, cache-first assets |
| `index.html` | Add `viewport-fit=cover`, multiple `apple-touch-icon` sizes, font `display=swap`, splash screen meta |
| `src/components/SearchBar.tsx` | Add `visualViewport` resize handler for iOS keyboard; `scrollIntoView` on results update |
| `src/App.tsx` | Lazy-load `Index` and `PersonPage` |
| `public/pwa/` | Generate all missing icon size PNGs |

### Technical Details

**Search keyboard fix**: In the mobile search dialog, add a `useEffect` that listens to `window.visualViewport.resize` event. On resize, set the dialog's max-height to `visualViewport.height`, ensuring results stay visible above the keyboard. Also call `scrollIntoView({ block: 'nearest' })` on the first result when results change.

**Service worker runtime caching**:
```typescript
runtimeCaching: [
  { urlPattern: /^https:\/\/.*\.supabase\.co\//, handler: 'NetworkFirst', options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } } },
  { urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/, handler: 'CacheFirst', options: { cacheName: 'image-cache', expiration: { maxEntries: 100, maxAgeSeconds: 30*24*60*60 } } },
  { urlPattern: /^https:\/\/fonts\.googleapis\.com\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-stylesheets' } },
  { urlPattern: /^https:\/\/fonts\.gstatic\.com\//, handler: 'CacheFirst', options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 20, maxAgeSeconds: 365*24*60*60 } } },
]
```

**Icon generation**: All icons will be generated as solid `#123026` background with "الخنيني" text or tree symbol, matching existing PWA icons.

