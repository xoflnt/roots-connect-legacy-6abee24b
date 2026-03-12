

# Onboarding "Data Ownership" + Children Dates + Final Cleanup

## What's already done (skip)
- Mandatory birth year on Step 5 (skip button removed, save disabled without year) ✓
- Verified badge on FamilyCard + PersonDetails ✓
- Instant refresh after save ✓

## What's still needed

### 1. Remove global "تخطي" button (line 266-268)
The progress bar area still has a global skip button. Remove it entirely — registration must be completed.

### 2. Pre-filled birth date for "child logging in" (Step 5)
When step 5 loads, check if `selectedMember.birth_year` exists but member is NOT in `verified_users`:
- Parse the existing `birth_year` string (format `YYYY/M/D`) and pre-fill `hijriDate` state
- Show info banner: "تم إدخال تاريخ ميلادك مسبقاً. يمكنك تأكيده أو تعديله الآن لتكتمل عملية توثيق حسابك."

Implementation: Add a `useEffect` watching `step === 5 && selectedMember` that checks `getVerifiedMemberIds().has(selectedMember.id)`. If not verified but has `birth_year`, parse and set `hijriDate`.

### 3. Parent Delegated Entry — Children's birth dates (Step 5)
Below the user's own date picker, add a collapsible section "تواريخ ميلاد الأبناء (اختياري)":
- Fetch children via `getChildrenOf(selectedMember.id)`
- For each child:
  - **Verified**: Show name + birth_year read-only with green badge "تم توثيق البيانات بواسطة [name] ✅"
  - **Not verified**: Show name + `HijriDatePicker` (year-only is sufficient)
- Store children dates in local state `childrenDates: Record<string, { day?: string; month?: string; year?: string }>`
- Pre-fill from existing `birth_year` if present
- On save (`handleComplete`), loop through `childrenDates` and call `updateMember(childId, { birth_year })` for each unverified child with a year set

### 4. Ensure "الخنيني" naming
Audit text in OnboardingModal for any "آل" prefix — currently shows "الخنيني" which is correct.

## Files to modify

| File | Change |
|---|---|
| `src/components/OnboardingModal.tsx` | Remove global skip, add pre-fill logic, add children dates section, update handleComplete |

No database or edge function changes needed — uses existing `updateMember` API.

