

# Fix KinshipCardView display labels

**File:** `src/components/kinship/KinshipCardView.tsx`

## Change 1: Dynamic LCA label (line 34)

Replace the static `lcaLabel` with logic that checks distances:

```typescript
const lcaLabel = (() => {
  const isFemale = result.lca?.gender === "F";
  if (result.dist1 === 1 && result.dist2 === 1) return isFemale ? "الأم المشتركة" : "الأب المشترك";
  if (result.dist1 === 1 || result.dist2 === 1) return isFemale ? "الجدة/الأم المشتركة" : "الجد/الأب المشترك";
  return isFemale ? "الجدة المشتركة" : "الجد المشترك";
})();
```

## Change 2: Distance badge pluralization (lines 198, 203)

Replace hardcoded `أجيال` with a helper:

```typescript
const genLabel = (d: number) => d === 1 ? "جيل" : d === 2 ? "جيلان" : "أجيال";
```

Then use `{genLabel(result.dist1)}` on line 198 and `{genLabel(result.dist2)}` on line 203.

