

# Family Passcode Gate — New Onboarding Step

## Overview
Insert a 6-digit "رمز دخول العائلة" step between name confirmation (step 3) and phone OTP (step 4). Total steps become 6.

## Changes

### `src/components/OnboardingModal.tsx`

**Step renumbering**: `TOTAL_STEPS = 6`. Current step 4 (phone) becomes step 5, current step 5 (hijri/complete) becomes step 6. All references to step numbers shift accordingly:
- Step 3 confirmation button: `setStep(4)` (passcode step, unchanged number but new content)
- Step 4: NEW passcode step
- Step 5: Phone OTP (was step 4)
- Step 6: Hijri date + complete (was step 5)

**New state**: `familyPasscode: string` (6 digits), no other state needed.

**New Step 4 UI**:
- Icon: `Lock` from lucide
- Title: "رمز دخول العائلة"
- Subtitle: "الرجاء إدخال الرمز السري الخاص بالعائلة للمتابعة"
- `InputOTP` with 6 slots (already imported in the file)
- "متابعة" button validates against `import.meta.env.VITE_FAMILY_PASSCODE || "339921"`
- Incorrect → `toast.error("الرمز السري غير صحيح...")` 
- Correct → `setStep(5)`
- Back button → `setStep(3)`

**All step number updates**:
- Line 23: `TOTAL_STEPS = 5` → `6`
- Line 129: `setStep(5)` → `setStep(6)` (polling success)
- Line 156: `setStep(5)` → `setStep(6)` (manual OTP verify)
- Line 357: step 2 next → `setStep(3)` (unchanged)
- Line 414: confirmation "نعم، هذا أنا" → `setStep(4)` (unchanged, now goes to passcode)
- Line 462: step 4 back button → `setStep(3)` becomes step 5 back → `setStep(4)`
- Step 5 pre-fill effect: `step === 5` → `step === 6`
- Step 5 rendering condition: `step === 5` → `step === 6`

### Files
| File | Change |
|---|---|
| `src/components/OnboardingModal.tsx` | Add passcode step, renumber steps 4→5, 5→6 |

No new files or dependencies needed — `InputOTP` and `Lock` icon are already available.

