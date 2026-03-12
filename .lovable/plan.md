

# Bidirectional Directional Kinship System

## Problem
Current UI shows one generic title like "ابن ابن عمه" — ambiguous because Arabic kinship is directional. Users can't tell who is what to whom.

## Approach

### 1. New bidirectional kinship function in `familyService.ts`

Add `kinshipDirectional(d1, d2, person1, person2)` returning `{ title1to2: string, title2to1: string, symmetric: boolean, symmetricTitle: string }`.

**Symmetric cases (d1 == d2):**
- `[0,0]`: "نفس الشخص"
- `[1,1]`: "أخوان شقيقان" / "أخوان من الأب" (with mother check + gender)
- `[2,2]`: "أبناء عم"
- `[3,3]`: "أبناء عمومة من الدرجة الثانية"
- `[n,n]` n>3: "أبناء عمومة من الدرجة [n-1]"

**Asymmetric — returns pair of titles:**
- `[0,1]` → P1: "أب", P2: "ابن"
- `[1,0]` → P1: "ابن", P2: "أب"
- `[0,2]` → P1: "جد", P2: "حفيد"
- `[1,2]` → P1: "عم", P2: "ابن أخ"
- `[2,1]` → P1: "ابن أخ", P2: "عم"
- `[1,3]` → P1: "عم الأب", P2: "ابن ابن أخ"
- `[2,3]` → P1: "ابن عم الأب", P2: "ابن ابن عم"
- Deep fallback: "يرتفع عن ... بـ X أجيال في شجرة النسب"

### 2. Refactor result header in `KinshipCalculator.tsx`

Replace the single badge with:

**Scenario A (symmetric):** Single sentence using names:
```
"خالد و محمد هما: أبناء عم"
```

**Scenario B (asymmetric):** Two styled rows:
```
"عاصم يعتبر: عم لـ عبدالله"
"عبدالله يعتبر: ابن أخ لـ عاصم"
```

### Files modified

| File | Change |
|---|---|
| `src/services/familyService.ts` | Add `kinshipDirectional()` function, export it |
| `src/components/KinshipCalculator.tsx` | Replace single title with bidirectional display using names |

