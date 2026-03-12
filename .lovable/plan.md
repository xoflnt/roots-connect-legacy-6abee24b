

# Add "Skip" Option to Onboarding Modal

## Problem
The onboarding modal is completely inescapable for non-logged-in users — no close button, no outside click, no Escape key. This blocks guests and elderly users from browsing the tree.

## Solution
Add a visible "تصفح كزائر" (Browse as Guest) skip button on Step 1, and remember the dismissal so the modal doesn't reopen on every page load. The modal will still auto-open once per session for first-time visitors, but can be freely dismissed.

## Changes to `src/components/OnboardingModal.tsx`

1. **Allow closing the dialog**: Change `onOpenChange={() => {}}` to `onOpenChange={setOpen}`, remove the `[&>button]:hidden` class, and remove the `onPointerDownOutside` / `onEscapeKeyDown` preventers.

2. **Add skip button on Step 1**: Below the "ابدأ التسجيل" button, add a ghost button "تصفح كزائر" that calls `handleSkip()` (already exists at line 84).

3. **Remember dismissal per session**: Use `sessionStorage` key `"onboarding-dismissed"`. On mount, if the key is set AND `forceOpen` is not true, don't auto-open. When `handleSkip` is called, set the key.

4. **forceOpen still works**: The CTA banner's "تسجيل الدخول" button on the landing page will still force-open the modal regardless of dismissal state.

## Files
| File | Change |
|---|---|
| `src/components/OnboardingModal.tsx` | Allow dismiss, add skip button, session memory |

