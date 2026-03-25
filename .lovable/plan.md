

# Fix Search Dropdown Position & Wave Balance

## Problem
1. Portal-rendered search dropdowns appear above the search bar on mobile (keyboard shifts viewport, `getBoundingClientRect` gives wrong position)
2. SVG wave is asymmetric

## Solution

### FIX 1: Remove portals, use overflow-x-hidden instead

**Line 186** — Change hero container:
```
FROM: <div className="relative overflow-hidden">
TO:   <div className="relative overflow-x-hidden">
```

Wrap the background image + overlays (lines 188-206) in a clipping container:
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <picture>...</picture>
  <div className="... dark overlay ..." />
  <div className="... gradient overlay ..." />
</div>
```

**Guest dropdown (lines 353-397)** — Remove `createPortal`, replace with inline absolute div:
```tsx
{showingResults && (
  <div
    className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-2xl border border-border"
    dir="rtl"
    style={{ zIndex: 9