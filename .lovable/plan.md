

# QA Audit — Issues Found & Fix Plan

## Issues Identified

### CRITICAL — Broken Functionality

**Issue 1: Guide "سجّل الآن" button does nothing**
- `src/pages/Guide.tsx:283` dispatches `open-onboarding` event
- **No component listens for this event** — `OnboardingModal` only opens via `forceOpen` prop
- Fix: Add `useEffect` listener in `LandingPage.tsx` for `open-onboarding` → `setForceOnboarding(true)`

**Issue 2: Guide "أرسل طلب تعديل" button does nothing**
- `src/pages/Guide.tsx:297` dispatches `open-request-form` event
- **No component listens for this event**
- Fix: Add `useEffect` listener in `LandingPage.tsx` for `open-request-form` → `setRequestOpen(true)`

### MEDIUM — Accessibility

**Issue 3: Admin refresh button below 44px minimum**
- `src/pages/Admin.tsx:211` — `h-8 w-8` = 32px, below the 44px accessibility target
- Fix: Change to `h-11 w-11 min-w-[44px] min-h-[44px]`

### MINOR — Consistency

**Issue 4: Profile fallback state uses `min-h-screen`**
- `src/pages/Profile.tsx:114` — not-logged-in state uses old `min-h-screen`
- Fix: Change to `min-h-[100dvh]`

**Issue 5: AdminProtect loading/login states use `min-h-screen`**
- `src/components/AdminProtect.tsx:76,85` — fallback states use `min-h-screen`
- Fix: Change both to `min-h-[100dvh]`

## Files to Modify

1. **`src/components/LandingPage.tsx`** — Add event listeners for `open-onboarding` and `open-request-form`
2. **`src/pages/Admin.tsx`** — Fix refresh button size
3. **`src/pages/Profile.tsx`** — Fix fallback min-h
4. **`src/components/AdminProtect.tsx`** — Fix fallback min-h

## Verified Working (No Issues Found)

- All page headers: correct safe-area, shrink-0, z-50
- Bottom nav: correct safe area, 6 tabs, active indicator
- All smart-back navigation working
- All switch-to-* events have listeners in Index.tsx
- Guide cards render correctly with full-width buttons
- All h-[100dvh] flex patterns correctly applied
- Documents page has safe-area-inset-top
- Admin uses 100dvh for table height
- PersonDetails drawer has safe-area bottom padding
- Viewport meta has viewport-fit=cover
- PWA install section shows/hides correctly

