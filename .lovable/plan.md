

# Redesign OnboardingModal — Stitch Design

## Summary
Visual redesign of OnboardingModal from 6 steps to 5 steps (remove Guide step). Full-screen dot-pattern background, new card-based hero sections, progress dots, refined typography. All existing logic preserved.

## Step Mapping
| Old | New | Change |
|-----|-----|--------|
| 1 Welcome | 1 Welcome | Visual redesign |
| 2 Guide | REMOVED | Feature tour eliminated |
| 3 Search | 2 Search | Visual redesign |
| 4 Passcode | 3 Family Code | Visual redesign |
| 5 Phone | 4 Phone | Visual redesign + WhatsApp toggle + privacy card |
| 6 Dashboard | 5 Birth Date | Visual redesign, keep children dates + quick update |

## File: `src/components/OnboardingModal.tsx`

### Structural changes
- Change `TOTAL_STEPS` from 6 to 5
- Remove step 2 (Guide) entirely
- Renumber steps: old 3→2, old 4→3, old 5→4, old 6→5
- Replace `Dialog` wrapper with a full-screen overlay div (fixed inset-0, z-50)
- Add dot-pattern background on the overlay: `bg-[#F6F3EE]` with `radial-gradient(rgba(118,90,0,0.08) 1px, transparent 0) / 24px 24px`
- Replace `Progress` bar with 5 progress dots at bottom (gold active pill, muted inactive circles)
- Add skip button top-right on all steps

### Step 1: Welcome
- Large white hero card (w-48 h-48, rounded-3xl, shadow) with TreePine icon
- Decorative sparkle "✦" elements around card (gold, opacity 0.6)
- Heading: "أهلاً بك في بوابة تراث الخنيني" (28px, font-weight 800, #1B5438)
- Subtitle: "فرع الزلفي — توثيق الإرث عبر الأجيال" (gold)
- Description paragraph (14px, muted, max-w-[320px])
- CTA: "ابدأ رحلتك ←" (h-14, rounded-full, primary green, shadow)
- "تصفح كزائر 👁" secondary link
- Large muted tree icon bottom-left (opacity 0.08)

### Step 2: Search
- Large heading right-aligned: "ابحث عن اسمك في الشجرة" (32px)
- Helper text below
- Search input: white card style (h-14, rounded-2xl, shadow)
- Results with "النتائج المحتملة" label + count badge
- Each result: white card (rounded-2xl, border, shadow-sm) with name, branch dot, chevron
- "استمرار" button + "تخطى هذه الخطوة" link
- Keep existing confirmation sub-step (UserCheck + "هل أنت X؟")

### Step 3: Family Code
- White hero card with Shield/Lock icon (gold)
- Heading: "تحقق من هويتك" (30px)
- OTP boxes: 52×60px each, rounded-xl, gold active border
- Error state in red
- "تأكيد الرمز" button with shield icon
- "لم أحصل على الرمز؟" link
- Step indicator: "الخطوة ٣ من ٥" bottom-left

### Step 4: Phone
- Hero card with Phone icon + gold shield overlay
- Heading: "أضف رقم جوالك"
- Phone input: country code box + number input (rounded-xl)
- Privacy note card: lock icon + muted bg
- WhatsApp toggle card (visual only, no new logic)
- "إرسال رمز التحقق" button

### Step 5: Birth Date
- Hero card with calendar icon + "التاريخ الهجري" label
- Heading: "أضف تاريخ ميلادك الهجري"
- 3 dropdowns (existing HijriDatePicker)
- Keep: children dates collapsible, quick update collapsible, pre-filled banner
- "أتم التسجيل ✓" button + "تخطى هذه الخطوة" link

### Shared elements
- AnimatePresence with slide animations (slideRight on next, slideLeft on back)
- Track direction state for animation
- All text RTL
- Min touch targets 44px

### Progress dots component
Small inline component: 5 circles, active one is a wider gold pill, inactive are small muted circles.

### Keep untouched
- All state variables, hooks, effects
- `handleComplete()`, `handlePhoneContinue()`, `handleSkip()`
- `familyContext` computation
- Logged-in "welcome back" dialog (keep existing design or lightly restyle)
- All imports for auth, services, data

