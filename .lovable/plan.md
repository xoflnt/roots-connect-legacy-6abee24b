

# Mobile UX Upgrade: Lineage, ListView, and Name Truncation Fix

## Three Issues to Address

### 1. FamilyCard Name Truncation (Tree View)
**Problem:** Card is `w-[220px]` with `truncate` on h3. In RTL, CSS `text-overflow: ellipsis` with `truncate` clips from the visual start (left in RTL = end of text), showing the **last** part of the name instead of the first.

**Fix in `FamilyCard.tsx`:**
- Change `truncate` to `direction: ltr` trick won't work for Arabic. Instead, use `text-overflow: ellipsis` with explicit `direction: rtl` and `text-align: center`.
- Actually the real fix: replace `truncate` with `line-clamp-2` so long names wrap to 2 lines instead of being cut. Adjust card height from fixed `h-[90px]` to `min-h-[90px]` to accommodate. Also update `NODE_HEIGHT` in `useTreeLayout.ts` slightly or keep dagre using the base height.
- This way full names show, and only extremely long names get ellipsized on line 2.

### 2. Lineage View — Premium Mobile Redesign
**Redesign `LineageView.tsx` for mobile:**
- Larger, more prominent timeline dots with a gradient connecting line
- Cards get subtle glass-morphism effect: `backdrop-blur-sm bg-card/80`
- Generation number badge on each card (الجيل ١, الجيل ٢...)
- Bigger touch targets, more padding
- The selected person's card gets a colored left/right border accent
- Add a "عرض نسب هذا الشخص" button on each ancestor card for quick lineage switching

### 3. List View — Premium Mobile Redesign
**Redesign `ListView.tsx` for mobile:**
- Replace flat rows with card-style items: rounded, with subtle shadow, spaced apart
- Show children count more prominently
- Add a subtle depth indicator (colored bar on the right matching branch depth)
- Smoother expand/collapse with better visual hierarchy
- When a person has children AND can be selected, show both actions clearly (expand + lineage arrow)
- Add swipe hint or tap-to-expand instruction

## Files to Modify

1. **`src/components/FamilyCard.tsx`** — `truncate` → `line-clamp-2`, `h-[90px]` → `min-h-[90px]`
2. **`src/hooks/useTreeLayout.ts`** — Increase `NODE_HEIGHT` to ~100 to give dagre more room
3. **`src/components/LineageView.tsx`** — Premium mobile redesign with generation badges, glass cards, gradient timeline
4. **`src/components/ListView.tsx`** — Card-based items, better spacing, depth colors, clearer hierarchy

