

# Fix KinshipCalculator — Kinship Terms + Canvas Share Card

## Fix 1: Complete Kinship Terms (`src/services/familyService.ts`)

### `kinshipToArabic()` — replace lines 208-245

Expand the function with complete mappings for all (dist1, dist2) up to 7. Key additions:

- **(2,2)** through **(5,5)**: cousin terms with gender awareness (`ابن عمه` / `بنت عمه`, `ابن عم أبيه` / `بنت عم أبيه`, `ابن عم جده` / `بنت عم جده`, etc.)
- **(1,4)**, **(1,5)**: `عم جده` / `عمة جده`, `عم جد جده`
- **(4,1)**, **(5,1)**: `ابن ابن ابن أخيه` / deep nephew
- **(2,4)**, **(4,2)**, **(2,5)**, **(3,4)**, **(4,3)**, **(3,5)**, **(5,3)**, **(4,5)**, **(5,4)**: cross-combinations with proper Arabic
- Deep fallback (any dist > 5): `"قريب بعيد"` instead of showing distances
- All other unhandled: `f1 ? "قريبته" : "قريبه"` (no empty strings)

### `asymTitle()` — replace lines 284-307

Mirror the same complete mappings. Key additions:
- **(2,2)**: `ابن عم` / `بنت عم`
- **(3,3)**: `ابن عم الأب` / `بنت عم الأب`
- **(4,4)**, **(5,5)**: cousin of grandfather terms
- **(2,4)**, **(4,2)**, **(3,4)**, **(4,3)**, etc.: cross-cousin terms
- **(4,1)**, **(5,1)**: deep nephew terms
- Fallback: return `f ? "قريبة" : "قريب"` — **never empty string**

### `kinshipDirectional()` — lines 255-282

- **(4,4)**: `"أبناء عم الجد"`
- **(5,5)**: `"أبناء عم جد الأب"`
- Keep existing logic, just ensure `toOrdinal` fallback never produces empty

## Fix 2: Canvas Share Card — Already Implemented

The `KinshipShareCard.ts` already uses pure Canvas 2D (no html2canvas). The `KinshipCardView.tsx` already imports `generateKinshipImage` from it. `html2canvas` is already removed from `package.json`. **No changes needed here** — the canvas implementation from the previous round is complete and correct.

## Files Changed

| File | Action |
|------|--------|
| `src/services/familyService.ts` | Edit — expand kinshipToArabic, asymTitle, kinshipDirectional |

No other files need changes.

