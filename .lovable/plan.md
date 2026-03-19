

# Fix All Onboarding Issues

## Bug Analysis

### BUG 1: Registration Flow
After code review, the flow logic (search → confirm → passcode → phone → complete) is **functionally correct**. The steps chain properly via `goToStep()`. However, the Step 4 button says "إرسال رمز التحقق" (Send verification code) which is misleading — no code is actually sent. This should say "متابعة" (Continue). No actual broken logic found.

### BUG 2: WhatsApp Toggle (lines 570-580)
The toggle card at lines 570-580 references a non-existent backend feature. Remove the entire block. Also remove the unused `MessageCircle` import.

### BUG 3 & 4: Arabic Numerals + Month Numbers
These affect `HijriDatePicker.tsx` (shared component used in OnboardingModal and Profile). Modifying the shared component is the correct approach — it fixes both pages at once.

**Note:** Requires touching 2 files instead of 1 (OnboardingModal.tsx + HijriDatePicker.tsx). Inlining the picker would be worse engineering.

## Changes

### File 1: `src/components/OnboardingModal.tsx`

1. **Remove WhatsApp toggle** (lines 570-580) — delete the entire `div` block with `MessageCircle`, `Switch`, and related text
2. **Remove unused imports**: `Switch`, `MessageCircle` from imports (lines 9, 13