

# Fix Child Display Names — Show First Name Only

## Problem
Children chips show full lineage names like "عبدالله بن علي بن محمد" instead of just "عبدالله".

## Solution
Apply `name.split(' بن ')[0]` to all child chip/badge displays across 4 files.

## Files to Modify

### 1. `src/components/PersonDetails.tsx` (line 297)
Change `{child.name}` → `{child.name.split(' بن ')[0]}`

### 2. `src/components/admin/members/MemberDetailSheet.tsx` (line 146)
Change `{child.name}` → `{child.name.split(' بن ')[0]}`

### 3. `src/components/LineageView.tsx` (line 477)
Change `{child.name}` → `{child.name.split(' بن ')[0]}`

### 4. `src/pages/Profile.tsx` (line 312)
Change `{child.name}` → `{child.name.split(' بن ')[0]}`

No changes needed in `OnboardingModal.tsx` — it already uses `child.name.split(" ")[0]` (similar effect).

Each child has a unique `id`, so "زيد بن علي" and "خالد بن علي" are separate members and won't be confused — we only change the display text, not the data or keys.

