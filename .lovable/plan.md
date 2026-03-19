

# Fix 1: Data Merge Logic + Fix 2: Onboarding Redesign

## Fix 1: `src/services/familyService.ts`

The merge logic at lines 34-46 actually looks structurally correct (starts with staticMembers, maps cloud overrides, appends cloud-only). However, the issue is likely that when `cloudMembers.length > 0` but the cloud has fewer records, the spread `{ ...m, ...cloudMap.get(m.id)! }` may override fields with `null`/`undefined` from cloud, effectively "deleting" data. The fix: filter out null/undefined values from cloud records before merging, so cloud only **enriches** static data, never blanks it.

**Change** (lines 34-46): Add a helper to strip null/undefined from cloud record before spreading. Also add a `console.log` for the merged count to aid debugging. Ensure `initialized = true` is set even when cloud returns empty (so static fallback is stable).

## Fix 2: `src/components/OnboardingModal.tsx` — Complete Visual Redesign

**Structural changes:**
- `TOTAL_STEPS`: 6 → 5
- Remove Step 2 (Guide) entirely — renumber: Welcome=1, Search=2, Passcode=3, Phone=4, BirthDate=5
- Replace `<Dialog>` wrapper with a full-screen `<div>` overlay (`fixed inset-0 z-50`)
- Background: `bg-[#F6F3EE]` with dot pattern via inline `backgroundImage`
- Replace `<Progress>` bar with 5 dot indicators at bottom (gold pill for active, muted circle for inactive)
- Add Framer Motion `AnimatePresence` with slide direction state for step transitions
- All step references shift: step 3→2, step 4→3, step 5→4, step 6→5

**Step 1 (Welcome):** Full-screen centered. Skip button top-right. White hero card (w-44 h-44, rounded-3xl) with TreePine icon. Sparkle decorations (✦). Green heading, gold subtitle, muted description. Full-width rounded-full CTA button with shadow. Secondary "تصفح كزائر 👁" link. Large decorative tree bottom-left at 6% opacity.

**Step 2 (Search):** Right-aligned large heading (text-3xl). White card-style search input (h-14, rounded-2xl). Results with "النتائج المحتملة" label + count badge. Each result as white rounded card. Sticky primary button at bottom. Skip link below.

**Step 3 (Passcode):** Shield icon hero card (w-36 h-36, gold icon). "تحقق من هويتك" heading. OTP boxes with gold active border, destructive error border. "تأكيد الرمز" button with Shield icon. Step indicator bottom-left.

**Step 4 (Phone):** Phone icon hero card with gold shield badge overlay. Country code "+966 🇸🇦" in separate box (w-24). Privacy note card with Lock icon. WhatsApp toggle row (visual only, uses existing Switch component).

**Step 5 (Birth Date):** Calendar hero card with "التاريخ الهجري" label. Keep ALL existing logic: HijriDatePicker, children dates collapsible, quick update collapsible, pre-filled banner. "أتم التسجيل ✓" button. Skip link.

**Preserved unchanged:**
- Logged-in "welcome back" dialog (lines 211-260) — kept as `<Dialog>`
- All state variables, hooks, handlers (`handleComplete`, `handlePhoneContinue`, `handleSkip`)
- `familyContext` computation
- All Supabase/auth calls, error handling, loading states
- All validation logic

**New imports needed:** `Shield`, `MessageCircle` from lucide-react; `Switch` from ui/switch.

### Files

| Action | File |
|--------|------|
| EDIT | `src/services/familyService.ts` (lines 34-46) |
| REWRITE | `src/components/OnboardingModal.tsx` (lines 262-669 only — keep logged-in dialog) |

