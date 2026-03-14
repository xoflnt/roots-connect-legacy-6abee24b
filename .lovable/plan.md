

# Redesign LandingPage.tsx

## Overview
Complete restructure of `LandingPage.tsx` (~550 lines) into a two-experience layout: personal dashboard for logged-in users, clean guest CTA for visitors. All existing handlers/props preserved.

## File: `src/components/LandingPage.tsx` (only file changed)

### Imports to Add
- `BadgeCheck`, `ChevronLeft` from lucide-react
- `getMemberById`, `getChildrenOf`, `getAncestorChain`, `getDepth` from familyService
- `getBranch`, `getBranchStyle` from branchUtils
- `HeritageBadge` from HeritageBadge
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from ui/collapsible

### Imports to Remove
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (PWA no longer uses tabs)
- `Calculator`, `UserCheck` (no longer used in How-to section, which is removed)
- `UserCircle` (replaced by dashboard)

### Keep Unchanged (internal)
- `useCountUp` hook
- `computeStats` function
- `StatCard` component
- `PILLAR_COLORS` constant
- Props interface `LandingPageProps`
- All state variables except removing none

### Section-by-Section Changes

**1. Hero (compact, max ~180px)**
- Remove PWA install button from hero top-left
- Keep only `ThemeToggle` + `FontSizeToggle` in top-left
- If `isAdmin`: add small `Shield` icon button in top-right (`h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10`)
- Shrink icon: `w-10 h-10` (no circle wrapper), just TreePine
- Title: "بوابة تراث الخنيني" as `text-2xl font-extrabold`
- Subtitle: "فرع الزلفي" as `text-sm text-muted-foreground`
- Thin gold gradient line: `h-px bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto`
- Remove the long paragraph subtitle
- Compact padding: `pt-12 pb-4`

**2A. Personal Dashboard (logged-in only)**
- Derive `member = getMemberById(currentUser.memberId)`
- Derive `branch = getBranch(currentUser.memberId)`, `branchStyle = getBranchStyle(branch.pillarId)`
- Derive `depth = getDepth(currentUser.memberId)`
- Derive `children = getChildrenOf(currentUser.memberId)`
- Derive `ancestors = getAncestorChain(currentUser.memberId)`
- Derive `siblings = member.father_id ? getChildrenOf(member.father_id).filter(s => s.id !== member.id) : []`

Card layout:
- Top row: gender icon (w-10 h-10 rounded-xl, male/female bg colors) + name + branch badge (pill with branch color) + `HeritageBadge type="generation" generationNum={depth}` + `BadgeCheck` verified icon
- Stats row: 3 columns — children count, ancestors count (chain.length - 1), siblings count
- Action row: 3 buttons — نسبي (navigate to /person/id), قرابة (onBrowseTree + dispatch kinship event), ملفي (navigate /profile)

**2B. Guest CTA (guest only)**
- "اكتشف موقعك في شجرة العائلة" heading
- Search bar (same existing implementation)
- Two side-by-side buttons: تصفح الشجرة + سجّل دخولك

**3. Search (logged-in only)**
- Compact search bar below dashboard, placeholder "ابحث عن أي فرد في العائلة..."
- Same search logic, same dropdown results

**4. كلمة الموثّق** — Keep exactly as-is, tighter padding `py-6`

**5. Three Pillars** — Keep exactly as-is, tighter padding `py-8`

**6. Browse Full Tree CTA** — Keep as-is

**7. Statistics** — Keep as-is, move before documents

**8. Historical Documents** — Keep as-is

**9. PWA Install (compact, no tabs)**
- Remove `Tabs` wrapper
- Stack Android section first, then iOS section below, separated by a simple divider
- Reduce padding, make it feel like a small info card

**10. About (collapsible)**
- Use `Collapsible` component
- Show first paragraph only by default
- "اقرأ المزيد ↓" trigger expands second paragraph
- State: `aboutOpen` boolean

**11. Footer**
- Add "أرسل طلب تعديل" button/link next to existing footer text
- Keep `SubmitRequestForm` dialog

### Removed Sections
- "كيف تستخدم المنصة" (How to Use) — entire section removed
- Admin red banner — replaced by subtle shield icon in hero
- Guest CTA banner (the big separate one) — replaced by section 2B
- "الانتقال لملفي الشخصي" button below search — moved to dashboard

### Section Order
1. Hero → 2A/2B → 3 (search) → كلمة الموثّق → Pillars → Full Tree CTA → Statistics → Documents → PWA Install → About (collapsible) → Footer

### Spacing
- All inter-section: `py-4` (tighter than current `py-6/8/12`)
- `max-w-lg mx-auto px-4` throughout

