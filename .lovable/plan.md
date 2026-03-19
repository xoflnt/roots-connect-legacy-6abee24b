

# Fix Font Size Toggle — Text-Only Scaling

## Problem
`FontSizeContext` sets `document.documentElement.style.fontSize` which scales ALL rem-based values (spacing, heights, widths, gaps), breaking layouts across the app.

## Solution: CSS class-based text-only scaling

### File 1: `src/contexts/FontSizeContext.tsx`
- Remove `FONT_SIZES` map and `document.documentElement.style.fontSize` line
- Replace with class toggle: remove `fs-normal`, `fs-large`, `fs-xlarge` from `<html>`, add `fs-${level}`
- Keep localStorage persistence and cycle logic unchanged

### File 2: `src/index.css`
- Change `html { font-size: 18px }` → `html { font-size: 16px }` (matches Tailwind default, no hydration flash)
- Add after existing styles:

```css
/* Font size scale classes */
.fs-normal  { --app-font-scale: 1; }
.fs-large   { --app-font-scale: 1.15; }
.fs-xlarge  { --app-font-scale: 1.3; }

/* Apply scale to text elements only */
.fs-large p, .fs-large span, .fs-large div,
.fs-large h1, .fs-large h2, .fs-large h3,
.fs-large h4, .fs-large button, .fs-large label,
.fs-large input, .fs-large textarea {
  font-size: calc(1em * 1.15) !important;
}
.fs-xlarge p, .fs-xlarge span, .fs-xlarge div,
.fs-xlarge h1, .fs-xlarge h2, .fs-xlarge h3,
.fs-xlarge h4, .fs-xlarge button, .fs-xlarge label,
.fs-xlarge input, .fs-xlarge textarea {
  font-size: calc(1em * 1.3) !important;
}

/* Exempt elements — never scale */
.fs-large .font-scale-exempt,
.fs-xlarge .font-scale-exempt {
  font-size: revert !important;
}
```

### File 3: `src/pages/Index.tsx`
- Add `font-scale-exempt` to bottom nav `<span>` labels (the `text-[10px]` tab labels)

### File 4: `src/components/AppHeader.tsx`
- Add `font-scale-exempt` to icon-only buttons (font toggle, theme toggle, admin, profile, guide)

### File 5: `src/pages/Admin.tsx`
- Add `font-scale-exempt` to stat cards area
- Change hardcoded `calc(100dvh - 400px)` → `calc(100dvh - var(--admin-header-h, 400px))`

### File 6: `src/components/OnboardingModal.tsx`
- Add `font-scale-exempt` to OTP input slots

### File 7: `src/components/tree/BranchesView.tsx`
- Add `font-scale-exempt` to branch tab trigger buttons

### File 8: `src/components/HeritageBadge.tsx`
- Add `font-scale-exempt` to the Badge component (has `text-[10px]`)

### File 9: `src/components/FontSizeToggle.tsx`
- Add `font-scale-exempt` to the badge overlay (`text-[9px]`)

