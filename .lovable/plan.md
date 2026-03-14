

# Fix All PWA & Mobile Navigation Issues

## Changes Overview

10 fixes across 6 files. No functionality changes — only layout, safe area, and navigation improvements.

## File 1: `src/components/AppHeader.tsx`
**Fix 8**: Line 41 — change `max(0.5rem,` to `max(0.75rem,` for consistent safe-area padding.

## File 2: `src/pages/Guide.tsx`
**Fix 3**: Convert from `min-h-screen` + `sticky top-0` to `flex flex-col h-[100dvh]` + `shrink-0` header + `flex-1 overflow-y-auto` main.
- Line 311: `min-h-screen` → `flex flex-col h-[100dvh]`
- Line 319: Remove `sticky top-0`, add `shrink-0`
- Line 334: Add `pb-[calc(2rem+env(safe-area-inset-bottom))]` and wrap content in scrollable main

**Fix 6**: Line 328 — replace `navigate("/")` with smart back: `window.history.length > 1 ? navigate(-1) : navigate("/")`

**Fix 7**: Line 421 — add `w-full` to action buttons

## File 3: `src/pages/Profile.tsx`
**Fix 3**: Convert layout pattern.
- Line 169: `min-h-screen` → `flex flex-col h-[100dvh]`
- Line 171: Remove `sticky top-0`, add `shrink-0`
- Line 183: Wrap main in `flex-1 overflow-y-auto`, add `pb-[calc(2rem+env(safe-area-inset-bottom))]`
- The `SubmitRequestForm` dialog (line 422) stays outside `<main>` (it's a portal)

**Fix 6**: Line 178 — replace `navigate("/")` with smart back

## File 4: `src/pages/Admin.tsx`
**Fix 3**: Convert layout.
- Line 205: `min-h-screen` → `flex flex-col h-[100dvh]`
- Line 206: Remove `sticky top-0`, add `shrink-0`, change `z-30` → `z-50` (Fix 4)
- Line 222: Wrap content div in `flex-1 overflow-y-auto`, add bottom safe area padding

**Fix 4**: Line 330 — change `calc(100vh - 400px)` → `calc(100dvh - 400px)`

**Fix 6**: Line 215 — replace `navigate("/")` with smart back

## File 5: `src/pages/Documents.tsx`
**Fix 1 + 3**: Convert layout and add safe-area-inset-top.
- Line 156: `min-h-screen` → `flex flex-col h-[100dvh]`
- Line 158: Remove `sticky top-0`, add `shrink-0`, add `style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}`
- Line 185: Wrap main in `flex-1 overflow-y-auto`, add bottom safe area padding

**Fix 6**: Line 163 — replace `navigate("/")` with smart back

Note: `DocumentViewer` is a dialog/sheet — stays outside `<main>`, renders as portal.

## File 6: `src/components/LandingPage.tsx`
**Fix 2A**: Line 166 — change `top-4 left-4` container to use `style={{ top: "max(1rem, env(safe-area-inset-top))" }}`
**Fix 2A**: Line 173 — same for admin shield: `style={{ top: "max(1rem, env(safe-area-inset-top))" }}`
**Fix 2B**: Line 162 — change `pt-12` to `style={{ paddingTop: "max(3rem, calc(env(safe-area-inset-top) + 1rem))" }}`
**Fix 2C**: Line 158 — on outermost div, add `style={{ paddingBottom: "env(safe-area-inset-bottom)" }}`
**Fix 9**: Line 158 — change `min-h-screen` → `min-h-[100dvh]`

## Summary Table

| Fix | Issue | Files |
|-----|-------|-------|
| 1 | Documents missing safe-area-top | Documents.tsx |
| 2 | LandingPage safe-area top+bottom | LandingPage.tsx |
| 3 | sticky→shrink-0 flex pattern | Guide, Profile, Admin, Documents |
| 4 | Admin 100vh→100dvh + z-index | Admin.tsx |
| 5 | Bottom safe area (via Fix 3) | Guide, Profile, Admin, Documents |
| 6 | Smart back navigation | Guide, Profile, Admin, Documents |
| 7 | Guide buttons full-width | Guide.tsx |
| 8 | Consistent header padding | AppHeader.tsx |
| 9 | min-h-screen→100dvh | LandingPage.tsx |
| 10 | No additional top bar needed | — (covered by Fix 2) |

