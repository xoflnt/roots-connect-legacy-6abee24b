

# Fix Two Issues in LineageView.tsx

## FIX 1: Remove duplicate generation badge

**Lines 378–386** — Delete the inline `<div>` that renders "الجيل X" with `dotColor` background. The `HeritageBadge` on line 349 already shows this. The `flex` wrapper on line 377 stays but only contains the age text.

## FIX 2: Fix branch badge opacity

**Line 341** — The branch badge uses `bs.bg` directly (e.g. `hsl(45 70% 92%)`) which is opaque. Since `bs.bg` is an HSL string (not hex), appending `99` won't work. Instead, wrap in an `hsla` with alpha, or simply add `opacity: 0.7` to the style.

Change:
```tsx
style={{ backgroundColor: bs.bg, color: bs.text }}
```
To:
```tsx
style={{ backgroundColor: bs.bg, color: bs.text, opacity: 0.7 }}
```

### Summary
- Delete lines 378–386 (duplicate generation div)
- Add `opacity: 0.7` to branch badge style on line 341
- Single file: `src/components/LineageView.tsx`

