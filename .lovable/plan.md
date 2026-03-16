

# Privacy Corrections: Add `101` to SPOUSE_EXEMPT + New `canSeeMotherName` Rule

## Changes

### 1. `src/utils/privacyUtils.ts`
- Add `'101'` to `SPOUSE_EXEMPT_IDS` → `['101', '200', '300', '400']`
- Add new exported function `canSeeMotherName(memberId, isLoggedIn)` using same `AGE_EXEMPT_IDS` list (200, 300, 400, 500, 600)

### 2. `src/components/FamilyCard.tsx` (line 238-252)
- Import `canSeeMotherName`
- Already has `isLoggedIn` from data prop
- Wrap mother name display: if `canSeeMotherName(member.id, isLoggedIn)` → show, else → show `PRIVATE_LABEL`

### 3. `src/components/PersonDetails.tsx` (line 143-153)
- Import `canSeeMotherName`
- Wrap the "الوالدة" section: if `canSeeMotherName(member.id, isLoggedIn)` → show, else → show `PRIVATE_LABEL` in same card layout

### 4. `src/components/tree/SmartNavigateView.tsx` (line 470-480)
- Import `canSeeMotherName`
- Wrap `والدته: {motherName}` on center card with `canSeeMotherName` check → show `PRIVATE_LABEL` if hidden

### 5. `src/components/tree/BranchesView.tsx` (line 428)
- Import `canSeeMotherName`
- Wrap motherName span with `canSeeMotherName` check → show `PRIVATE_LABEL` if hidden

### 6. `src/components/LineageView.tsx` (line 267-274)
- Import `canSeeMotherName`
- Wrap the mother name pill with `canSeeMotherName(member.id, isLoggedIn)` check → show `PRIVATE_LABEL` if hidden

### 7. `src/components/kinship/KinshipCardView.tsx` (line 330, 349-356)
- Change `showMother` from `canSeeSpouses` to `canSeeMotherName` — this is semantically more correct for this field
- Import `canSeeMotherName`

### 8. `src/components/kinship/KinshipDocumentView.tsx` (line 25-26)
- Change `canSeeSpouses` to `canSeeMotherName` for mother name visibility checks

### 9. `src/components/kinship/KinshipTreeView.tsx` (lines 97-104, 141-148)
- Change `canSeeSpouses` to `canSeeMotherName` for the mother name display checks on end nodes

### 10. `src/components/kinship/KinshipShareCard.ts` (line 273-281)
- Add `isLoggedIn` parameter to `generateKinshipImage`
- Import `canSeeMotherName`
- Wrap mother name canvas drawing with `canSeeMotherName` check — if hidden, skip drawing or draw `PRIVATE_LABEL` in muted style
- Update all callers of `generateKinshipImage` to pass `isLoggedIn`

### Summary
- 1 file updated (privacyUtils.ts): add `'101'` to spouse exempts + new `canSeeMotherName` function
- 9 component files updated to apply `canSeeMotherName` wherever "والدته/والدتها" is displayed
- Mother name uses same exemption list as age (IDs 200, 300, 400, 500, 600)

