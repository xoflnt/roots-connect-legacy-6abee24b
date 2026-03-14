

# Two Changes: Bottom Nav + BranchesView Mobile Dashboard

## Change 1: Remove "القوائم" from Bottom Nav (`AppHeader.tsx`)

**Single edit**: Remove the list item from the `navItems` array (line 27). The array becomes 3 items: الشجرة, النسب, القرابة. The bottom nav auto-distributes evenly via `flex justify-around`. No other changes needed — the list mode still exists inside TreeModeSwitcher.

## Change 2: Redesign Mobile BranchesView (`BranchesView.tsx`)

Replace the current `MobileBranchesView` (branch selector cards + generation scroll rows) with a statistics dashboard. Desktop accordion stays untouched.

### Architecture
```text
MobileBranchesView
├── BranchTabs (3 sticky pill tabs at top)
├── BranchHeroCard (overview stats for selected branch)
├── GenderDistribution (animated male/female bars)
├── GenerationPyramid (horizontal bars per generation, tappable)
│   └── Sheet (bottom) with generation members list
├── NotableMembers (4 spotlight cards, horizontal scroll)
└── CommonNames (top 5 first names with bars)
```

### Data calculations (all in `useMemo`, keyed on `selectedBranch`)

From `getAllMembers()` filtered by `getBranch(m.id)?.pillarId`:

- **Total count**: `branchMembers.length`
- **Generation count**: number of distinct `getDepth()` values
- **Sub-branch count**: count of members where `isBranchHead(m.id)` is true, plus 1 for the pillar
- **Gender split**: filter by `m.gender`
- **Generation groups**: `Map<number, FamilyMember[]>` grouped by depth, sorted ascending
- **Notable members**:
  - المؤسس: pillar member by ID
  - أكبر عمراً: earliest `birth_year` among living (no `death_year`)
  - أكثر أبناء: max `getChildrenOf(m.id).length`
  - أحدث مولود: latest `birth_year`
- **Common names**: split `m.name` by space, take first word, count frequencies, top 5

### Component details

**BranchTabs**: 3 equal-width pills in a sticky `flex` row. Active pill gets `backgroundColor: branchStyle.text, color: white`. Inactive: transparent with `color: branchStyle.text`. Smooth `transition-all duration-200`.

**BranchHeroCard**: `rounded-2xl border-r-4` in branch color. Background gradient at 8% opacity. Shows: branch name, founder name (tappable → PersonDetails), 3 stat columns (icon + number + Arabic label: فرداً / أجيال / أفرع). Uses `Users`, `Layers`, `GitBranch` icons.

**GenderDistribution**: Card with title "توزيع الجنس". Two horizontal bars side by side (male hsl(var(--male)), female hsl(var(--female))). Width animated via `transition: width 600ms ease` on branch switch. Shows percentage + exact counts.

**GenerationPyramid**: Card with title "الأجيال". Each row: generation label + proportional bar (width relative to largest generation) + count. Bar color = branch color with opacity varying by generation depth. Bars animate width from 0 with staggered delay (`index * 0.08s`). Each row tappable → opens bottom Sheet showing that generation's members as compact rows (name + age + BadgeCheck + tap → PersonDetails).

**NotableMembers**: Title "أبرز الأفراد". Horizontal scroll, 4 cards at 140px wide. Each: role label on top, member name, relevant detail (age/children count). `rounded-2xl`, branch color border. Tappable → PersonDetails.

**CommonNames**: Title "أكثر الأسماء شيوعاً". Top 5 rows: rank number + name + proportional bar (branch color) + count. Animated width on branch switch.

### New imports needed
- `Sheet, SheetContent, SheetHeader, SheetTitle` from `@/components/ui/sheet`
- `Heart, Crown, Baby, Trophy, Layers` from `lucide-react` (some already imported)
- `parseArabicYear` from `@/utils/ageCalculator`
- `getMemberById` from `@/services/familyService`

### Files modified
| File | Change |
|------|--------|
| `src/components/AppHeader.tsx` | Remove list item from `navItems` array (line 27) |
| `src/components/tree/BranchesView.tsx` | Replace `MobileBranchesView` + `MemberCard` with dashboard components |

No other files touched. Desktop BranchesView accordion unchanged.

