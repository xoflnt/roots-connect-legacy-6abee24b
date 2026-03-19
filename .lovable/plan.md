

# Apply Arabic Tatweel to Person Names & Headings

## Helper Pattern
Each file that needs first-name tatweel will use:
```ts
const tatweelName = (fullName: string) => {
  const parts = fullName.split(' ');
  parts[0] = applyTatweel(parts[0]);
  return parts.join(' ');
};
```

## Changes

### 1. `src/components/PersonDetails.tsx`
- Add import: `import { applyTatweel } from "@/utils/tatweelUtils";`
- Add `tatweelName` helper
- Line 91: `{member.name}` → `{tatweelName(member.name)}` (the large `text-xl` heading)

### 2. `src/components/tree/SmartNavigateView.tsx`
- Add import: `import { applyTatweel } from "@/utils/tatweelUtils";`
- Add `tatweelName` helper
- Line 448: `{member.name}` → `{tatweelName(member.name)}` (the `text-lg` center card name)

### 3. `src/components/FamilyCard.tsx`
- Add import: `import { applyTatweel } from "@/utils/tatweelUtils";`
- Add `tatweelName` helper inside the component
- Line 114: `{member.name}` → `{tatweelName(member.name)}` (mobile compact card)
- Line 208: `{member.name}` → `{tatweelName(member.name)}` (desktop card)

### 4. `src/components/KinshipCalculator.tsx`
- Add import: `import { applyTatweel } from "@/utils/tatweelUtils";`
- Line 323: `حاسبة القرابة` → `{applyTatweel("حاسبة القرابة")}` (heading text)

### 5. `src/components/kinship/KinshipCardView.tsx`
- Add import: `import { applyTatweel } from "@/utils/tatweelUtils";`
- Add `tatweelName` helper
- Line 35: `name1 = person1.name.split(" ")[0]` → `name1 = applyTatweel(person1.name.split(" ")[0])`
- Line 36: same for `name2`
- Line 337 (PersonChip): `{member.name}` → wrap first word with tatweel: `{tatweelName(member.name)}`

### 6. `src/components/kinship/KinshipShareCard.ts`
- Add import: `import { applyTatweelCanvas } from "@/utils/tatweelUtils";`
- Add canvas helper:
  ```ts
  const twName = (n: string) => { const p = n.split(' '); p[0] = applyTatweelCanvas(p[0]); return p.join(' '); };
  ```
- Line 106: `name1 = person1.name.split(" ")[0]` → `name1 = applyTatweelCanvas(person1.name.split(" ")[0])`
- Line 107: same for `name2`
- Line 267: `firstName = member.name.split(" ")[0]` → `firstName = applyTatweelCanvas(member.name.split(" ")[0])`

### 7. `src/components/LandingPage.tsx`
- Already imports `applyTatweel`
- Line 491: `ركائز العائلة` → `{applyTatweel("ركائز العائلة")}`

### 8. `src/components/AppHeader.tsx`
- Already applied — no change needed

## Summary
- **7 files** modified
- Person names: tatweel on first word only
- Headings: tatweel on full string
- Canvas: uses `applyTatweelCanvas` variant

