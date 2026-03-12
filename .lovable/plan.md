

# Smart Arabic Kinship Logic — Linguistic & Genealogical Overhaul

## Changes

### 1. `src/services/familyService.ts` — Refactor `kinshipToArabic`

**Pass person objects** instead of just distances so we can check mother names for siblings.

New signature: `kinshipToArabic(dist1, dist2, person1?, person2?)`

- `[1,1]`: Extract mother via `extractMotherName()` for both. Same mother → "أخ شقيق" / "أخت شقيقة" (based on person2 gender). Different/missing → "أخ من الأب" / "أخت من الأب".
- `[1,2]`: "عمه" (kept). `[2,1]`: "ابن أخيه" (kept).
- `[2,2]`: "ابن عمه" (kept).
- All other cases remain as-is.

**Add new helper** `generationText(n: number): string`:
- 1 → "بجيل واحد"
- 2 → "بجيلين"  
- 3–10 → "بـ X أجيال"
- \>10 → "بـ X جيلاً"

**Add helper** `lcaContextWord(dist1, dist2): string`:
- If both distances are 1 → "والدهما" (their father)
- Otherwise → "جدهما المشترك"

### 2. `src/components/kinship/types.ts` — Add mother names

Add `motherName1` and `motherName2` optional strings to `KinshipViewProps`.

### 3. `src/components/KinshipCalculator.tsx` — Compute & pass mother names

After computing `result`, derive `motherName1 = extractMotherName(person1)` and `motherName2 = extractMotherName(person2)`. Pass both + `inferMotherName` fallback to all 3 view components.

Update `kinshipToArabic` call to pass person objects for sibling detection.

### 4. `src/components/kinship/KinshipTreeView.tsx` — Show mothers

Under each person card at the bottom of each column, add a subtle line: `الأم: [name]` if available.
Change LCA apex label: if `dist1===1 && dist2===1` show "الأب" instead of "الجد المشترك".

### 5. `src/components/kinship/KinshipDocumentView.tsx` — Full rewrite of text

- Use `lcaContextWord()` → "يجتمع X و Y في والدهما Z" or "...جدهما المشترك Z"
- Use `generationText()` → "بجيل واحد" / "بجيلين" / "بـ ٣ أجيال"
- Append mothers line: "(والدة X هي Y، ووالدة Z هي W)."
- Keep chain flows below.

### 6. `src/components/kinship/KinshipInteractiveView.tsx` — Show mothers

Under each person's bottom card, add mother name in subtle text. Same LCA label logic.

## Files modified
| File | Change |
|---|---|
| `src/services/familyService.ts` | New `generationText`, `lcaContextWord`, update `kinshipToArabic` for siblings |
| `src/components/kinship/types.ts` | Add `motherName1`, `motherName2` to props |
| `src/components/KinshipCalculator.tsx` | Compute mother names, pass to views, update `kinshipToArabic` call |
| `src/components/kinship/KinshipTreeView.tsx` | Display mothers, context-aware LCA label |
| `src/components/kinship/KinshipDocumentView.tsx` | Rewrite text generation with proper Arabic grammar |
| `src/components/kinship/KinshipInteractiveView.tsx` | Display mothers, context-aware LCA label |

