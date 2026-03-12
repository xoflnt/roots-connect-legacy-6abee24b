

# Critical Hotfix Plan — Data Pipeline & State Synchronization

## Bugs Identified

1. **Payload key mismatch**: Frontend sends `childName`/`child_name`, `spouseName`/`spouse_name` inconsistently. Edge function expects `childName`, `gender`, `birthYear` — but onboarding sends `child_name`, `child_gender`, `spouse_name`.
2. **Missing mother name**: `add_child` in `SubmitRequestForm` and `OnboardingModal` has no mother input. Edge function doesn't write notes.
3. **No state refresh after Admin approve**: `Admin.tsx` calls `loadData()` but never calls `refreshMembers()` or dispatches `family-data-updated`.
4. **Birth date goes through admin queue unnecessarily**: OTP-verified users' birth date should update directly.

## Changes

### 1. Edge Function (`supabase/functions/family-api/index.ts`)

Fix `add_child` handler to accept both key formats and write mother notes:
```
// Accept both childName and child_name
const childName = data.childName || data.child_name || "غير محدد";
const gender = data.gender || data.child_gender || "M";
const motherName = data.motherName || data.mother_name || "";
const notes = motherName 
  ? `${gender === "F" ? "والدتها" : "والدته"}: ${motherName}` 
  : null;
```

Fix `add_spouse` to accept both formats:
```
const newSpouse = data.spouseName || data.spouse_name || "";
```

### 2. `SubmitRequestForm.tsx` — Add Mother Input for add_child

- Add `motherName` state
- Add `<Input>` for "اسم الأم" when `requestType === "add_child"`
- Include `motherName` in payload: `data.motherName = motherName`

### 3. `OnboardingModal.tsx` — Add Mother Input + Direct Birth Update

- Add `quickChildMother` state for the quick-update child section
- Include `mother_name` in the add_child request data
- **Direct birth_year update**: In `handleComplete`, if `dateStr` exists, call `updateMember(selectedMember.id, { birth_year: dateStr })` directly instead of going through admin queue. The `registerVerifiedUser` already does this partially but via a different path.

### 4. `Admin.tsx` — Global State Refresh After Approve

In `RequestCard.handleApprove`, after `approveRequest` succeeds:
```typescript
import { refreshMembers } from "@/services/familyService";

const handleApprove = async () => {
  setLoading("approve");
  const success = await approveRequest(req.id);
  if (success) {
    await refreshMembers();
    window.dispatchEvent(new Event("family-data-updated"));
  }
  onAction();
};
```

Same for reject (just refresh to sync state).

### 5. `dataService.ts` — Fix `registerVerifiedUser` Birth Update

Currently calls `updateMember(user.memberId, { birth_year: user.hijriBirthDate })` — this is correct but should also work without going through admin queue. Verify this path works (it calls `family-api/update-member` which directly updates the DB — this is already correct).

## Files Changed

| File | Change |
|---|---|
| `supabase/functions/family-api/index.ts` | Accept both key formats, write mother notes on add_child |
| `src/components/SubmitRequestForm.tsx` | Add mother name input for add_child |
| `src/components/OnboardingModal.tsx` | Add mother name to quick-child, direct birth_year update |
| `src/pages/Admin.tsx` | Call `refreshMembers()` + dispatch event after approve/reject |

