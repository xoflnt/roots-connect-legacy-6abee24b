

# Fix All PWA Issues

## Files to modify

### 1. `vite.config.ts` — Icons, manifest fields, offline fallback

**Separate maskable icons** (lines 81-83): Split combined `"any maskable"` into separate entries.

**Add manifest fields** after line 72:
- `id: '/?source=pwa'`
- `screenshots` array with narrow form factor
- `shortcuts` for search and tree views

**Add offline fallback** in workbox config (after line 25):
```
additionalManifestEntries: [
  { url: '/offline.html', revision: '1' }
],
```

### 2. `index.html` — Dark mode theme-color

Replace single `<meta name="theme-color" content="#123026" />` with two media-query variants:
- Light: `#123026`
- Dark: `#0a1a10`

### 3. `src/index.css` — Native feel CSS

Add to `@layer base` section:
- `-webkit-tap-highlight-color: transparent` on `*`
- `user-select: none` on `nav, button, .card-interactive`
- `overscroll-behavior: none` in `@media (display-mode: standalone)`
- `-webkit-touch-callout: none` on `img`

Add view transition CSS:
- `@view-transition { navigation: auto; }` with fade+slide keyframes
- `prefers-reduced-motion` guard

Note: `touch-action: manipulation` already exists on `*` (line 181).

### 4. `src/hooks/usePWABadge.ts` — New file

Create hook that calls `navigator.setAppBadge(count)` / `clearAppBadge()` based on a count parameter, with feature detection.

### 5. `src/pages/Admin.tsx` — Use badge hook

Import `usePWABadge` and `useRequests`. Call `usePWABadge(pendingCount)` inside `AdminContent` to show pending request count on the app icon.

### 6. View Transitions in `src/App.tsx`

This project uses `react-router-dom` with `<BrowserRouter>`. The CSS `@view-transition { navigation: auto }` rule handles MPA-style transitions automatically for supported browsers. No JS changes needed — the CSS alone enables it for browsers that support it, and it's ignored by others.

## Summary of changes
| File | Change |
|------|--------|
| `vite.config.ts` | Split maskable icons, add id/screenshots/shortcuts, add offline fallback |
| `index.html` | Dark mode theme-color meta tag |
| `src/index.css` | Native feel CSS + view transitions |
| `src/hooks/usePWABadge.ts` | New file — app badge hook |
| `src/pages/Admin.tsx` | Use badge hook with pending requests count |

