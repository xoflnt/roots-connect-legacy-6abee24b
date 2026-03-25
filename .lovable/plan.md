

# Fix Search Results Dropdown — Solid Background

## Problem
Both search dropdowns (guest line 341, logged-in line 449) already use `bg-card` which should be opaque, but the parent wrapper's `z-index` and the glass hero behind them may cause visual blending on some devices.

## Changes — Single file: `src/components/LandingPage.tsx`

### Fix 1: Guest search wrapper (line 328)
Change `z-20` → `z-40` on the wrapper div so the dropdown clears all hero glass elements.

### Fix 2: Guest search dropdown (line 341)
Add `shadow-2xl` (already has `shadow-xl`) and explicit solid background to ensure opacity:
```
className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto"
style={{ backgroundColor: 'var(--card)' }}
```
The inline `backgroundColor` with CSS variable guarantees the card color is applied as a solid layer even if Tailwind's `bg-card` gets overridden by parent glass styles.

### Fix 3: Logged-in search wrapper (line 436)
Change `z-20` → `z-40`.

### Fix 4: Logged-in search dropdown (line 449)
Same treatment as guest dropdown — add `shadow-2xl` and inline `backgroundColor`:
```
className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto"
style={{ backgroundColor: 'var(--card)' }}
```

## Summary
- Line 328: `z-20` → `z-40`
- Line 341: `shadow-xl` → `shadow-2xl`, add inline `style`
- Line 436: `z-20` → `z-40`
- Line 449: `shadow-xl` → `shadow-2xl`, add inline `style`

