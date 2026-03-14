

# Redesign BranchesView: Mobile Generations Layout

## Summary
Add a mobile-specific layout to `BranchesView.tsx` that shows branch selector cards + generation-grouped horizontal card rows. Desktop keeps the existing accordion tree unchanged.

## Single file modified: `src/components/tree/BranchesView.tsx`

### Architecture
```text
BranchesView()
  ├─ isMobile? → MobileBranchesView (new)
  │    ├─ 3 branch selector cards (stacked, one active)
  │    ├─ Generation sections (grouped by getDepth)
  │    │    ├─ Section header: "الجيل X • Y شخصاً"
  │    │    └─ Horizontal scroll row of MemberCard components
  │    └─ PersonDetails drawer
  └─ !isMobile? → existing accordion tree (unchanged)
```

### Data logic (useMemo)
1. `getAllMembers()` → filter by `getBranch(m.id)?.pillarId === selectedBranchId`
2. Group by `getDepth(m.id)` into `Map<number, FamilyMember[]>`
3. Sort each group by `sortByBirth()`
4. Sort generations ascending by depth number
5. Skip generations with 0 members

### New sub-components (all inside same file, React.memo)
- **`MemberCard`**: 130px wide, min-h-[80px], rounded-xl, gender border, branch dot, name (2-line truncate), age, children count (gender-aware), BadgeCheck, deceased HeritageBadge+opacity. Staggered `animate-fade-in` via `animationDelay: index * 0.04s`.
- **`MobileBranchesView`**: Contains branch selector state + generations rendering.

### Branch selector cards
- 3 stacked full-width cards: `rounded-2xl border-r-4 bg-card/80 backdrop-blur-sm p-4 min-h-[64px]`
- Branch color dot + label + count ("٨٧ فرداً") + ChevronLeft
- Active: `shadow-md border-primary/50 ring-1 ring-primary/20`
- Default selected: first PILLAR (`"200"` - فرع محمد, matching PILLARS order)
- Tap selects + auto-scrolls to generations via `ref.scrollIntoView()`

### Generation sections
- Header: `bg-muted/30 rounded-xl px-3 py-2 border-r-3` in branch color, shows "الجيل X • Y شخصاً"
- Row: `flex flex-row-reverse gap-3 overflow-x-auto pb-2 pr-4` with `scrollbar-hide` (CSS `scrollbar-width: none; -webkit-overflow-scrolling: touch`)
- Shows ~2.5 cards visible to hint at scroll

### Responsive switch
- Import `useIsMobile` from `@/hooks/use-mobile`
- Early in render: `if (isMobile) return <MobileBranchesView ... />`
- Else: return existing desktop accordion (no changes)

### Imports to add
- `getAllMembers` from familyService
- `getBranch` from branchUtils  
- `useIsMobile` from hooks
- `BadgeCheck` already imported
- `useRef` for scroll target

