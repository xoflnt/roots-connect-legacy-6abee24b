

# Fix Broken النسب Tab

## Problem
`if (v === "lineage") return;` in both `Index.tsx` (line 58) and `PersonPage.tsx` (line 49) blocks the النسب tab entirely.

## Changes

### 1. `src/pages/Index.tsx`
- Import `useAuth` and add `Sheet` components for the lineage search dialog
- Add `showLineageSearch` state
- Replace the `if (v === "lineage") return;` block with logic that:
  - If logged in → `navigate(/person/${currentUser.memberId})`
  - If not logged in → `setShowLineageSearch(true)`
- Add a bottom Sheet containing the same search UI (reuse `searchMembers` + `getLineageLabel`) with title "ابحث عن شخص لعرض نسبه"
- On select → `navigate(/person/${id})`, close sheet

### 2. `src/components/AppHeader.tsx`
- Accept an optional `isLineageActive` prop (boolean)
- In the bottom nav, change the active check for the lineage tab: `const isActive = item.value === "lineage" ? !!isLineageActive : activeView === item.value;`
- Same for the desktop ToggleGroup value — no change needed since PersonPage already passes `activeView="lineage"`

### 3. `src/pages/PersonPage.tsx`
- Remove the `if (v === "lineage") return;` on line 49 (it's already on the lineage page, so tapping النسب again should be a no-op or stay)
- Pass `isLineageActive={true}` to AppHeader so the tab highlights correctly

### 4. `src/pages/Index.tsx` — pass `isLineageActive={false}` to AppHeader

This ensures:
- النسب tab works from Index (navigates to lineage)
- النسب tab highlights when on /person/:id
- No existing navigation is broken

