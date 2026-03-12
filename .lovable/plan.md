

# UI/UX Restructuring — Implementation Plan

## Files to Change

### 1. `src/utils/branchUtils.ts` — Add `DOCUMENTER_ID`
- Export `DOCUMENTER_ID = "209"`

### 2. `src/components/HeritageBadge.tsx` — Add documenter badge type
- Add `"documenter"` to the type union and CONFIG:
  - Label: `"موثق الشجرة"`
  - Icon: `ScrollText` (from lucide)
  - Color: royal gold/bronze `bg-[hsl(35,70%,25%)]/15 text-[hsl(35,70%,30%)] border-[hsl(35,60%,40%)]/30`

### 3. `src/components/FamilyCard.tsx` — Show documenter badge
- Import `DOCUMENTER_ID` from branchUtils
- If `member.id === DOCUMENTER_ID`, render `<HeritageBadge type="documenter" />`

### 4. `src/components/PersonDetails.tsx` — Show documenter badge
- Same logic as FamilyCard

### 5. `src/components/LandingPage.tsx` — Reorder sections
New order inside the component:
1. **Hero** (title + subtitle) — compact, remove `min-h-screen`, no CTA buttons here
2. **كلمة الموثّق** — moved up directly after hero. Make "علي المحمد" a clickable `<Link to="/person/209">` with gold styling
3. **Search bar** — extracted below the quote
4. **Three Pillars** — unchanged
5. **"تصفح كامل الشجرة" CTA** — new prominent full-width button after pillars
6. **Statistics** — unchanged
7. **How to Use** — unchanged, move "أرسل طلب تعديل" button here
8. **About** — unchanged
9. **Footer**

### 6. `src/components/OnboardingModal.tsx` — Step 5 Mini-Dashboard
Replace the plain Hijri date screen (lines 532-548) with a rich card:

**Welcome header:**
- `مرحباً بك، [selectedMember.name]`
- Father name via `getFatherName(selectedMember)`
- Branch name via `getBranch(selectedMember.id)`

**عائلتك حالياً (Current Family Context):**
Using `getAllMembers()` synchronously (already loaded):
- **Siblings**: Filter members where `father_id === selectedMember.father_id && id !== selectedMember.id`. Show as a compact list (names only, max ~10).
- **Spouses**: Parse `selectedMember.spouses` field (split by `،`). Show if exists.
- **Children**: Filter members where `father_id === selectedMember.id`. Show as compact list.

Each section only renders if non-empty. Uses simple styled divs with icons (Users2, Heart, UserPlus).

**Hijri Date (mandatory label but skip allowed):**
- `HijriDatePicker` component

**Optional Quick-Update section:**
- Collapsible "هل تود تحديث بياناتك الآن؟ (اختياري)" with:
  - Add spouse name input
  - Add child name + gender select
  - Correction text input
- On "حفظ والدخول للبوابة", after `handleComplete()`, also call `submitRequest()` for each filled optional field

**Buttons:**
- "حفظ والدخول للبوابة" (primary)
- "تخطي" (ghost)

### 7. Global "آل" audit
Already verified clean — no instances found.

## Summary of changes
| File | Change |
|---|---|
| `src/utils/branchUtils.ts` | Add `DOCUMENTER_ID` export |
| `src/components/HeritageBadge.tsx` | Add documenter badge type |
| `src/components/FamilyCard.tsx` | Render documenter badge |
| `src/components/PersonDetails.tsx` | Render documenter badge |
| `src/components/LandingPage.tsx` | Reorder sections, clickable documenter name |
| `src/components/OnboardingModal.tsx` | Step 5 mini-dashboard with family context + optional quick-update |

