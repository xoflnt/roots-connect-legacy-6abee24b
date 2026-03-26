

# Fix Generation Badge Opacity

## Single file: `src/components/HeritageBadge.tsx`

**Line 29** — change the generation config className:

```
FROM: "bg-secondary text-secondary-foreground border-border/50"
TO:   "bg-secondary/40 text-secondary-foreground border-secondary/60 backdrop-blur-sm"
```

This matches the transparency pattern used by other badges (founder: `bg-accent/20`, branchHead: `bg-primary/15`).

No changes needed in other files — `LineageView.tsx`, `KinshipCalculator.tsx`, and `FamilyCard.tsx` all use `<HeritageBadge type="generation" />` which reads from this single CONFIG object. The fix propagates everywhere automatically.

