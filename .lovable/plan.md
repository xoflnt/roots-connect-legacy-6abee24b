

# Merge Navigation into Single Bottom Bar

## Overview
Replace the two-layer navigation (3-item bottom bar + 4-item TreeModeSwitcher) with one unified 6-item bottom nav. Remove TreeExplorer wrapper.

## New Type
```ts
type AppTab = 'map' | 'navigate' | 'branches' | 'nasab' | 'kinship' | 'list';
```

## Files to Modify

### 1. `src/pages/Index.tsx` — Major rewrite
- Replace `activeView` state with `activeTab: AppTab` (persisted to `localStorage` key `khunaini-active-tab`, default `'map'`)
- Remove `TreeExplorer` import; import `FamilyTree`, `SmartNavigateView`, `BranchesView`, `ListView` directly
- Render each tab's view directly in `<main>`:
  - `map` → `<FamilyTree>` (keep ref, focusBranch). Use CSS visibility trick: always mounted, hidden when inactive, to avoid React Flow re-init
  - `navigate` → `<SmartNavigateView />`
  - `branches` → `<BranchesView />`
  - `nasab` → no view (opens sheet, tab stays on previous)
  - `kinship` → `<KinshipCalculator />`
  - `list` → `<ListView />`
- Add the 6-item mobile bottom nav directly in Index.tsx (not in AppHeader)
- `nasab` tab: opens the existing lineage sheet, does NOT change `activeTab`
- Search behavior: if `activeTab === 'map'` → `treeRef.current?.search(id)`, else → `navigate(/person/${id})`
- Update `onBrowseTree` to set `activeTab = 'map'`
- Pass updated `activeTab` mapping to AppHeader's `activeView` prop for desktop

### 2. `src/components/AppHeader.tsx` — Simplify
- **Remove** the mobile bottom nav entirely (moved to Index.tsx)
- Update `ViewMode` type and desktop `navItems` to: `map | navigate | branches | list | kinship` (5 items, no nasab — desktop uses route-based lineage)
- Desktop segmented control labels: خريطة | تنقل | فروع | قائمة | قرابة
- Icons: Map, Compass, GitFork, AlignJustify, Users
- Keep all header buttons (home, admin, profile, guide, search, reset, font, theme)
- Reset button shows when `activeView === 'map'`

### 3. `src/pages/PersonPage.tsx` — Update nav mapping
- Update `onViewChange` to navigate with new tab names: `navigate('/?view=${v}')` 
- Desktop nav still shows with `isLineageActive={true}`

### 4. Bottom Nav Component (inline in Index.tsx)
6 items, RTL order (right to left): خريطة — تنقل — فروع — نسب — قرابة — قائمة

```text
┌──────┬──────┬──────┬──────┬──────┬──────┐
│ خريطة│ تنقل │ فروع │ نسب  │ قرابة│ قائمة│
│  Map │Compas│GitFrk│BookOp│Users │AlignJ│
└──────┴──────┴──────┴──────┴──────┴──────┘
```

- Styling: `fixed bottom-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40`
- Active: `text-primary` + top accent bar + `scale-110` icon + bold label
- `min-h-[56px]` + `paddingBottom: env(safe-area-inset-bottom)`
- `< 360px` screens: hide labels via `@media` or JS check
- `nasab` tab: shows as active when on `/person/:id` route (it won't since we're on Index, so it's never active here — correct behavior)

### 5. React Flow Persistence
To avoid re-initializing React Flow on tab switch:
- Always render `<FamilyTree>` but wrap in a div that uses `visibility: hidden` + `absolute inset-0` when not active
- Other tabs use conditional rendering with `animate-fade-in`

### Files NOT modified
- `src/components/tree/SmartNavigateView.tsx` — unchanged
- `src/components/tree/BranchesView.tsx` — unchanged  
- `src/components/FamilyTree.tsx` — unchanged
- `src/components/ListView.tsx` — unchanged
- `src/components/KinshipCalculator.tsx` — unchanged
- `src/components/tree/TreeModeSwitcher.tsx` — no longer imported (can be deleted later)
- `src/components/tree/TreeExplorer.tsx` — no longer imported (can be deleted later)

### localStorage Migration
- Read old `khunaini-tree-mode` on first load, map to new `khunaini-active-tab` key, then delete old key

