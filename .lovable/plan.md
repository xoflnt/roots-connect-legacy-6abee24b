

# Premium Family Heritage Portal - Complete UI/UX Overhaul

This is a large transformation covering theming, a new landing page, 3 display modes, and a revamped navigation. Here's the implementation plan broken into logical pieces.

## Files to Modify (DO NOT touch `familyData.ts`)

### 1. Theme Update: `src/index.css`
- Update CSS variables for the premium heritage palette:
  - Light: Warm sand background (`#FDFBF7`), deep palm green primary (`#1B4332`), muted gold accent (`#D4AF37`)
  - Dark: Deep navy/charcoal tones with gold accent
- Add a `--gold` CSS variable for accent highlights
- Keep existing male/female/canvas tokens, just update primary/secondary/accent

### 2. Tailwind Config: `tailwind.config.ts`
- Add `gold` color token mapped to `--gold` variable
- Add keyframes for `fade-in`, `slide-up`, `scale-in` animations

### 3. Landing Page: `src/pages/Index.tsx` (complete rewrite)
- State: `activeView: 'landing' | 'tree' | 'lineage' | 'list' | 'table'`
- State: `lineageTargetId: string | null` for lineage view
- Render `AppHeader` when not on landing, otherwise render `LandingPage`
- Pass view switching and search callbacks down

### 4. New Component: `src/components/LandingPage.tsx`
- Hero section with title "شجرة عائلة الخنيني" and subtitle
- Central search bar (reuse search logic from `SearchBar`) - on select, switch to `lineage` view with that member
- CTA button "تصفح الشجرة الكاملة" → switches to `tree` view
- About section about محمد بن سالمة and Banu Tamim connection
- Elegant scroll layout with fade-in animations

### 5. Revamped Header: `src/components/AppHeader.tsx`
- Update `ViewMode` type to `'tree' | 'lineage' | 'list' | 'table'`
- Glassmorphism styling (already has `backdrop-blur-xl`)
- Replace ToggleGroup with 4-option segmented control: الشجرة التفاعلية | سلسلة النسب | عرض القوائم | جدول البيانات
- Add a "الرئيسية" (Home) button to go back to landing
- Show search bar only in tree mode

### 6. Smart Collapsible Tree: `src/hooks/useTreeLayout.ts`
- Accept `expandedIds: Set<string>` parameter
- Only include nodes whose ancestors are all expanded
- Gen 1 (root "100") and Gen 2 (direct children of root, plus their father_id chain) shown by default
- Build a `childrenOf` map, then filter `familyMembers` to only include visible ones before dagre layout
- Return `hasChildren` map so FamilyCard can show expand button

### 7. Updated `src/components/FamilyTree.tsx`
- Manage `expandedIds` state (initially: root + gen2 parents)
- Pass `expandedIds` to `useTreeLayout`
- Pass `onToggleExpand` callback via node data
- Re-layout when expandedIds changes (useTreeLayout becomes a function, not just a hook with empty deps)

### 8. Updated `src/components/FamilyCard.tsx`
- Add expand/collapse `(+)`/`(-)` button at bottom edge if node `hasChildren`
- Button calls `onToggleExpand(memberId)` from data
- Subtle animation on the button

### 9. New Component: `src/components/LineageView.tsx`
- Props: `memberId: string`
- Build ancestor chain: walk up `father_id` from member to root
- Render vertical timeline with connecting lines
- Each ancestor rendered as a styled card (name, dates, spouse info)
- Bottom = selected person (highlighted), top = root ancestor
- Smooth fade-in animation for each step

### 10. New Component: `src/components/ListView.tsx`
- Accordion-based nested list of the entire family
- Start with root members (father_id === null)
- Each item shows name + basic info, and if has children, an accordion trigger
- Clicking expands to show children, recursively
- Uses Radix Accordion components already installed
- Mobile-optimized with large touch targets

### 11. Minor Updates
- `src/components/SearchBar.tsx`: Update placeholder text, keep functionality
- `src/components/SpouseCard.tsx`: No changes needed

## Architecture Flow

```text
Index.tsx
├── activeView === 'landing' → <LandingPage />
│   ├── Hero + Search → onSearch → setView('lineage')
│   └── CTA → setView('tree')
├── activeView !== 'landing' → <AppHeader /> + view content
│   ├── 'tree'    → <FamilyTree /> (with collapse/expand)
│   ├── 'lineage' → <LineageView memberId={...} />
│   ├── 'list'    → <ListView />
│   └── 'table'   → <DataTableView />
```

## Implementation Order
1. Theme (index.css + tailwind.config.ts)
2. LandingPage component
3. Index.tsx rewrite with view state
4. AppHeader update
5. LineageView component
6. ListView component
7. Smart collapsible tree (useTreeLayout + FamilyTree + FamilyCard updates)

