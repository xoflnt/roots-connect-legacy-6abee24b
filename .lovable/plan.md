

# Build Data Health Admin Section

## Files to Create

### 1. `src/hooks/admin/useDataHealth.ts`
Custom hook that runs 5 client-side checks against `getAllMembers()`:
- **Missing birth year** (warning) — members without `birth_year`
- **No spouse** (info) — living males at depth ≥ 3 without spouses
- **Orphaned father_id** (critical) — `father_id` points to nonexistent member
- **Duplicate names** (warning) — same `name` + `father_id` combo
- **Missing mother** (info) — no `والدت` pattern in notes

Computes a health score (0-100) weighted by severity. Returns `{ health, isLoading }`.

### 2. `src/components/admin/data-health/HealthScoreRing.tsx`
SVG circular progress ring (120px). Color shifts green/amber/red based on score. Center shows `toArabicNum(score)٪`.

### 3. `src/components/admin/data-health/DataHealthPage.tsx`
Main page with:
- Score ring at top
- 5 collapsible category cards (using shadcn Collapsible), each showing severity icon, label, count badge
- Expanded view lists affected members (name + branch badge), capped at 20 with overflow text
- "إعادة الفحص" refresh button
- RTL, all numbers via `toArabicNum`

## Files to Modify

### 4. `src/pages/Admin.tsx`
- Add import for `DataHealthPage`
- Add `{section === "data-health" && <DataHealthPage />}`
- Add `"data-health"` to the fallback exclusion list

### 5. `src/components/admin/AdminSidebar.tsx`
Uncomment the `data-health` nav item only (keep content/analytics/settings commented).

### 6. `src/components/admin/AdminBottomBar.tsx`
Add `data-health` tab with `Activity` icon and label "صحة البيانات" to `MAIN_TABS` (now 5 tabs total — fits mobile bar).

