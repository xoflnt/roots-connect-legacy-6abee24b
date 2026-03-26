

# Fix Two Issues in LineageView.tsx

## FIX 1: Remove duplicate generation badge

**Lines 378–386** — Delete the inline `<div>` that renders "الجيل X" with `dotColor` background. The `HeritageBadge` on line 349