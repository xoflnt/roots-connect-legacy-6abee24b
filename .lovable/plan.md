

# PWA Install Prompt

## Files to Create

### 1. `src/hooks/usePWAInstall.ts`
Hook that captures `beforeinstallprompt` event, detects iOS, checks standalone mode, and exposes `{ canInstall, isIOS, isInstalled, triggerInstall }`.

### 2. `src/components/PWAInstallBanner.tsx`
Dismissible bottom banner (mobile only via `useIsMobile()`):
- Positioned above mobile bottom nav: `bottom: calc(4rem + env(safe-area-inset-bottom))`
- Uses `usePWAInstall` hook
- Dismiss stored in localStorage (`khunaini-pwa-dismissed`) with 7-day re-show
- Auto-hides after 15 seconds
- Android: shows "تثبيت الآن" button calling `triggerInstall()`
- iOS: shows share instructions text instead
- Never renders on desktop or when already installed
- Uses `Smartphone` and `X` icons from lucide-react
- All tap targets min 44×44px, RTL, Arabic text

## Files to Edit

### 3. `src/App.tsx`
Import and render `<PWAInstallBanner />` alongside `<SWUpdateBanner />` (line 52 area).

### 4. `src/components/LandingPage.tsx`
Add a small install pill button in the hero section (near theme toggles, line ~134) using `usePWAInstall`. Shows `Smartphone` icon + "تثبيت التطبيق" when `canInstall` is true. Calls `triggerInstall()` on Android, shows iOS instructions via a toast/dialog on iOS.

## Summary

| File | Action |
|------|--------|
| `src/hooks/usePWAInstall.ts` | Create |
| `src/components/PWAInstallBanner.tsx` | Create |
| `src/App.tsx` | Add banner import + render |
| `src/components/LandingPage.tsx` | Add install pill in hero |

