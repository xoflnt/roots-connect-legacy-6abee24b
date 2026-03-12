

# Remove WhatsApp OTP, Simplify Phone Step

## Overview
Strip out all OTP verification logic and UI. The phone step becomes a simple phone number collection with a "متابعة" button that validates format and proceeds directly to the final Hijri date step.

## Changes to `src/components/OnboardingModal.tsx`

### Remove
- Import of `sendOTP`, `checkOTPStatus`, `verifyOTP`, `SendOTPResult` from wasageSms
- OTP-related state: `otpSent`, `otpResult`, `otpCode`, `otpVerified`, `otpError`, `polling`, `pollingRef`
- Functions: `startPolling`, `handleSendOTP`, `handleVerifyOTP`
- Cleanup effect for `pollingRef`
- Remove unused icons: `QrCode`, `ExternalLink`, `MessageCircle`

### Simplify Step 5 (Phone)
- Remove the entire OTP UI (QR code, clickable link, polling indicator, OTP input, "تغيير الرقم" button)
- Keep only: phone input with +966 prefix, validate length ≥ 9 digits
- Change button text to "متابعة"
- On click: validate phone format → `setStep(6)`
- Back button → `setStep(4)`

### Keep unchanged
- `TOTAL_STEPS = 6` (step count stays the same)
- Step 6 (Hijri date + complete) — untouched
- `handleComplete` — untouched (already saves phone correctly)

## Files
| File | Change |
|---|---|
| `src/components/OnboardingModal.tsx` | Remove OTP imports/state/functions/UI, simplify Step 5 |

