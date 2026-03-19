

# Fix Admin Panel Issues

## Summary
Fix 4 bugs: father search result limit, missing father's spouses display, Hijri date picker upgrade, and mobile layout issues.

## Files to Modify (4)

### 1. `src/components/admin/members/AddMemberSheet.tsx`

**BUG 1 — Father search limit**: The `FatherSearchResults` component caps results at 30 (line 608-609). Fix:
- Empty query: show first 20 males sorted alphabetically by name
- With query: show ALL matches (remove `.slice(0, 30)`)
- The component currently doesn't receive the Command input query (it has its own unused `query` state and `shouldFilter=false` on parent Command). Fix by capturing the search input via a `useEffect` listening to the Command input, or better: remove `FatherSearchResults` as a separate component and inline the logic, using `CommandInput`'s `onValueChange` to track the query in parent state.
- Fix display: Line 1 = `m.name` (bold, as-is). Line 2 = `"بن {fatherName}"` + branch badge + generation + children count.

**BUG 2 — Father's spouses**: After father selection (line 255-361), add a section showing `selectedFather.spousesArray` as muted badges with label "زوجات الأب:".

**BUG 3 — Hijri date picker**: Replace birth year `Input` (lines 391-411) with the existing `HijriDatePicker` component from `src/components/HijriDatePicker.tsx`. Store state as `{ day?: string; month?: string; year?: string }` instead of a single string. On save, compose `birth_year` as `"{day}/{month}/{year}"` if day+month present, else just year. Same for death year (lines 438-462). Update `handleBirthYearChange`/`handleDeathYearChange` and validation to work with the new structure.

**BUG 4 — Mobile sheet height**: Change mobile sheet class from `h-[92vh]` to `h-[90dvh]` and ensure `overflow-y-auto` on content area. Add `w-full` to inputs.

### 2. `src/components/admin/AdminLayout.tsx`

**BUG 4 — Layout**: 
- Add `overflow-x-hidden` to main content area
- Change mobile padding from `pb-20` to `pb-24`

### 3. `src/components/admin/members/MemberListPage.tsx`

**BUG 4 — Filter overflow**:
- Change filter row from horizontal scroll flex to `grid grid-cols-2 gap-2` on mobile, `flex` on desktop
- Each Select: add `min-w-0` to prevent overflow

### 4. `src/components/admin/dashboard/DashboardPage.tsx`

**BUG 4 — Branch cards**:
- Branch overview grid already uses `grid gap-3` which stacks on mobile — verify this is correct (it is, single column by default)
- Stats grid already has `grid-cols-2 md:grid-cols-3` — no change needed
- Sync section: ensure `flex-col` on mobile (already has `flex-col sm:flex-row`)

No changes needed for DashboardPage — it's already correct.

## Technical Notes
- Reuse existing `HijriDatePicker` component for birth/death date fields
- Father search: track query via `onValueChange` on `CommandInput`
- Composed date format: `"day/month/year"` or just `"year"` when