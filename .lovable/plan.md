

# Phase 1B: Dashboard Page + Member List

## Files to Create (6)

### 1. `src/hooks/admin/useDashboard.ts`
Custom hook that loads dashboard stats using `getAllMembers()`, `getRequests()`, `getVerifiedUsers()`, `getVisitCount()`. Returns `{ stats: DashboardStats, isLoading, refetch }`. Computes `livingMembers` as `members.filter(m => !m.death_year).length`, `pendingRequests` from requests with status `'pending'`.

### 2. `src/hooks/admin/useMembers.ts`
Custom hook for filtered, paginated member browsing. Enriches each member with `branch` (via `getBranch`), `generation` (via `getDepth`), `isDeceased`, `fatherName`, `spousesArray`. Filters using `arabicMatch` for search, plus branch/status/gender/generation dropdowns. PAGE_SIZE=30. Resets page on filter change. Exports `EnrichedMember` and `MemberFilters` interfaces.

### 3. `src/components/admin/dashboard/DashboardPage.tsx`
Props: `onNavigate: (section: AdminSection) => void`

Layout:
- **Action banner** (amber, only if pendingRequests > 0) — tappable, navigates to `'requests'`
- **Stats grid** — 2-col mobile, 3-col desktop. 5 stat cards (totalMembers/TreePine, livingMembers/Heart, activeUsers/Users, totalVisits/Eye, pendingRequests/FileText). Numbers via `toArabicNum()`.
- **Branch overview** — 3 cards with colored right borders (green=300, amber=200, orange=400). Shows per-branch member count computed client-side from `getAllMembers()` + `getBranch()`.
- **Sync section** — moved from existing DashboardContent (sync button + STATIC_COUNT display + syncResult)
- **Refresh button** in header

### 4. `src/components/admin/members/MemberListPage.tsx`
Uses `useMembers()` hook.

- Header: "الأعضاء" + Badge with total count
- Search Input (debounced 300ms), placeholder: "ابحث بالاسم أو المعرف..."
- Filter row (horizontal scroll on mobile): 4 Select dropdowns for branch/status/gender/generation
- List of `MemberCard` components
- `Pagination` component at bottom

### 5. `src/components/admin/members/MemberCard.tsx`
Props: `member: EnrichedMember`, `isEven: boolean`

Card row (min-h-16):
- Right: branch color dot (6px) + name (font-semibold) + "بن {fatherName}" lineage + generation badge "ج{N}"
- Left: birth year + deceased indicator (رحمه/رحمها الله) + placeholder ⋮ button
- Even rows get `bg-muted/30`

### 6. `src/components/admin/shared/Pagination.tsx`
Props: `page, totalPages, onPageChange`

Centered: prev (ChevronRight in RTL) + "صفحة X من Y" + next (ChevronLeft in RTL). Buttons disabled at boundaries. Min-h-12 buttons.

## Files to Modify (1)

### 7. `src/pages/Admin.tsx`
- Remove the inline `DashboardContent` component (lines 150-500+) and `StatCard`/`RequestCard` helpers — they move to `DashboardPage`
- Keep `AdminProtect`, `getDescendants`, `buildCSV`, `downloadCSV` helpers, and the sync logic (these get used by DashboardPage)
- Wire up section routing in `AdminContent`:
  - `'dashboard'` → `<DashboardPage onNavigate={setSection} />`
  - `'members'` → `<MemberListPage />`
  - Others → placeholder "قيد التطوير"

## Technical Notes
- `getBranch()` from `branchUtils.ts` walks `father_id` chain — called per member during enrichment (one-time on mount)
- `getDepth()` from `familyService.ts` counts hops to root — same pattern
- All numbers displayed via `toArabicNum()`
- All containers `dir="rtl"`, logical properties (`ms-*`/`me-*`)
- Min font 16px, min tap 48px throughout
- Select dropdowns use existing `@/components/ui/select`
- Sync button and export features stay in DashboardPage (moved from old DashboardContent)

