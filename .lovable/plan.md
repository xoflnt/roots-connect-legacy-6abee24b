

# Fix Search Results Visibility in LandingPage.tsx

## Root Cause

The hero container on line 184 has `overflow-x-hidden`. In CSS, when you set `overflow-x: hidden` on an element, the browser automatically changes `overflow-y` from `visible` to `auto`. This means content that extends below the hero boundary (like the search dropdown) gets clipped — even though only `x` was set to hidden.

The background images are already wrapped in their own `overflow-hidden` container (line 186), making the `overflow-x-hidden` on the outer hero div redundant.

## Fix — Single file: `src/components/LandingPage.tsx`

### Line 184 — Remove `overflow-x-hidden`

```
FROM: <div className="relative overflow-x-hidden">
TO:   <div className="relative">
```

This allows the search dropdown to extend below the hero section naturally. The background images remain clipped by their own inner wrapper (line 186: `<div className="absolute inset-0 overflow-hidden pointer-events-none">`).

### Verify no horizontal overflow

The wave SVG container (line 552) already has its own `overflow-hidden`. No other absolute-positioned element inside the hero should cause horizontal overflow once the background is contained.

## Result
- Search dropdown (both guest and logged-in) will render visibly above all content
- Background images stay clipped in their own container
- Wave/gradient remain below search via z-index hierarchy (z-[5] vs z-99999)

