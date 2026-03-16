

# Privacy Layer for Guest Users

## Overview
Create a UI-only privacy layer that hides age and spouse information from non-authenticated users, controlled by a single utility file. No data filtering at the service level.

## Files to Create

### 1. `src/utils/privacyUtils.ts` (NEW)
Privacy utility with:
- `canSeeAge(memberId, isLoggedIn)` — exempt IDs: 200, 300, 400, 500, 600
- `canSeeSpouses(memberId, isLoggedIn)` — exempt IDs: 200, 300, 400
- `PRIVATE_LABEL` = '🔒 معلومة خاصة لأفراد العائلة'
- `getSpouseLabel(spouseName, index, isLoggedIn)` — returns "زوجة ١/٢/..." for guests

## Files to Modify

### 2. `src/components/FamilyCard.tsx`
- Import `useAuth`, privacy utils
- **Problem**: `FamilyCard` is a ReactFlow node — calling `useAuth()` inside it won't work since it's rendered by ReactFlow outside normal React tree. Instead, pass `isLoggedIn` through the `data` prop in `FamilyCardData` type.
- Where `ageText` is displayed (lines ~97 mobile, ~222 desktop): wrap with `canSeeAge` check, show `PRIVATE_LABEL` if false
- Where `spouseNames` are displayed (lines ~193-200 desktop): wrap with `canSeeSpouses` check, show `PRIVATE_LABEL` if false
- Update the `useTreeLayout.ts` hook (or wherever FamilyCardData is constructed) to pass `isLoggedIn` in node data

### 3. `src/components/PersonDetails.tsx`
- Import `useAuth`, privacy utils
- Age section (line 117-127): conditional on `canSeeAge` → show `PRIVATE_LABEL`
- Spouses section (lines 202-225): conditional on `canSeeSpouses` → show `PRIVATE_LABEL`
- Children grouped by mother (lines 228-262): replace mother name headers with `getSpouseLabel(motherKey, index, isLoggedIn)`. Single wife → show "الأبناء" without name for guests.

### 4. `src/components/tree/SmartNavigateView.tsx`
- Already imports `useAuth` (line 3). Use `isLoggedIn = !!currentUser`
- Center card age (line 447): wrap with `canSeeAge`
- Center card spouse list (lines 463-472): wrap with `canSeeSpouses`
- Center card mother name (lines 448-458): wrap with `canSeeSpouses` for the *parent's* spouse visibility
- SonCard age (line 103-104): pass `isLoggedIn` as prop, wrap with `canSeeAge`
- FatherCard age (line 164-168): pass `isLoggedIn` as prop, wrap with `canSeeAge`

### 5. `src/components/tree/BranchesView.tsx`
- Import `useAuth`, `canSeeAge`, `PRIVATE_LABEL`
- GenMemberRow age (line 130-132): wrap with `canSeeAge` check
- NotableCard age details: wrap with `canSeeAge` check

### 6. `src/components/LineageView.tsx`
- Import `useAuth`, all privacy utils
- Age per card (line 324-326): wrap with `canSeeAge`
- Spouse display (lines 343-353): wrap with `canSeeSpouses`
- Children grouped by mother (lines 376-414): use `getSpouseLabel` for group headers
- Pass `isLoggedIn` to `generateLineageImage` call (line 81)

### 7. `src/components/KinshipCalculator.tsx`
- Already imports `useAuth`. Add privacy utils
- Person display chips showing mother names: wrap with `canSeeSpouses`

### 8. `src/components/kinship/KinshipCardView.tsx`
- Import `useAuth`, privacy utils
- PersonChip mother name (lines 340-343): wrap with `canSeeSpouses`
- No age displayed in this component currently — no change needed for age

### 9. `src/components/LineageShareCard.ts` (Canvas)
- Update `generateLineageImage` signature to accept `isLoggedIn: boolean = false`
- When drawing spouse names on canvas: check `canSeeSpouses`, draw `PRIVATE_LABEL` in muted style if false
- When drawing age: check `canSeeAge`, skip line entirely if false
- Update call in LineageView.tsx to pass `isLoggedIn`

### 10. `src/hooks/useTreeLayout.ts`
- Pass `isLoggedIn` into node data so FamilyCard can access it (since FamilyCard can't use hooks directly as