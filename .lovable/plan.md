

# Kinship Calculator — 3 Tabbed Result Views + Auto-fill Current User

## Overview
Refactor the result section of `KinshipCalculator.tsx` into 3 togglable views using shadcn Tabs, and auto-fill Person 1 from `currentUser` context. No new dependencies needed — CSS animations from tailwind config cover the interactive path view.

## Changes

### File: `src/components/KinshipCalculator.tsx`

**1. Auto-fill Current User**
- Import `useAuth` from `AuthContext`
- Initialize `person1` state: if `initialMemberId` use that, else if `currentUser?.memberId` exists, find that member from `getAllMembers()` and pre-fill
- User can still clear and pick someone else

**2. Replace Result Section with Tabs**
- Import `Tabs, TabsList, TabsTrigger, TabsContent` from `./ui/tabs`
- Import `TreePine, FileText, Route` icons from lucide
- Wrap the entire result block (lines 202-266) in a `<Tabs defaultValue="tree">` with 3 triggers:
  - `"tree"` → "المخطط الشجري" (default)
  - `"document"` → "الوثيقة التراثية"  
  - `"path"` → "المسار التفاعلي"

**3. View 1 — Tree Diagram ("المخطط الشجري")**
- Relation badge at top (same gold accent header)
- LCA card at apex center with gold/accent ring styling
- 2-column grid below: right column = path from LCA → Person 1 (descending), left column = path from LCA → Person 2 (descending)
- Vertical connector lines (`w-px bg-border`) between cards, downward arrows via `ChevronDown`

**4. View 2 — Heritage Document ("الوثيقة التراثية")**
- Classic textual card with decorative borders
- Main text: "يجتمع [name1] و [name2] في جدهما المشترك [lca name]."
- Sub-text: "حيث يبعد [name1] عنه (x) أجيال، ويبعد [name2] عنه (y) أجيال."
- Below: horizontal text flow showing the chain: `[جد] ← [أب] ← ... ← [شخص]` for each person

**5. View 3 — Interactive Path ("المسار التفاعلي")**
- Person 1 and Person 2 rendered side-by-side at the bottom
- Staggered CSS `animate-fade-in` with increasing `animation-delay` for each parent going upward
- LCA card at top pops in last with `animate-scale-in` + a subtle glow ring (`ring-2 ring-accent/50`)
- Uses existing tailwind keyframes — no framer-motion needed

**6. Shared elements across all views**
- The relation text badge stays above the tabs
- "بحث جديد" reset button stays below the tabs
- Widen max container to `max-w-lg` to fit the 2-column tree view

### Styling
- Active tab: `data-[state=active]:bg-primary data-[state=active]:text-white` for high visibility
- All text uses "الخنيني" — no "آل" prefix anywhere
- Uses existing palette (primary = palm green, accent = warm sand/gold)

