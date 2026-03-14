

# Family Tree Map — 4 Visual Enhancements

## Enhancement 1: Bezier Edges
**File: `src/hooks/useTreeLayout.ts` (lines 174-185)**
- Change `type: "smoothstep"` → `type: "default"` (React Flow's bezier)
- Change `strokeWidth: 2.5` → `strokeWidth: 2`

## Enhancement 2: Generation Number on Cards
**File: `src/hooks/useTreeLayout.ts`**
- Import `getDepth` from `@/services/familyService`
- Add `generation: getDepth(member.id)` to each node's data object (line 156-165)

**File: `src/components/FamilyCard.tsx`**
- Add `generation` to `FamilyCardData` type
- In both mobile and desktop cards, add a generation badge in top-left corner:
  ```tsx
  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-muted-foreground/60">
    ج{member.generation.toLocaleString("ar-SA")}
  </span>
  ```
- Add `generation` to the memo comparator

## Enhancement 3: Generation Bands
**File: `src/components/FamilyTree.tsx`**

Create a new `GenerationBand` node type component (inline or separate file `src/components/GenerationBandNode.tsx`):
- Simple div, no handles, not selectable/draggable
- Even generations: `bg-muted/10`, odd: transparent
- Label "الجيل X" positioned at the right edge

In `FamilyTree.tsx`:
- Register `generationBand` in `nodeTypes`
- Compute generation band nodes in a `useMemo` from `layoutNodes`:
  - Group nodes by `data.generation`, find yMin/yMax per generation
  - Create wide band nodes (width 99999, x: -50000) at each generation's y range
  - Set `zIndex: -1`, `selectable: false`, `draggable: false`
- Merge band nodes with layout nodes before passing to ReactFlow
- Filter band nodes out of MiniMap via `nodeColor` (return transparent for band type)

**New file: `src/components/GenerationBandNode.tsx`**
```tsx
const GenerationBandNode = ({ data }) => (
  <div
    className="w-full h-full pointer-events-none"
    style={{ background: data.isEven ? 'hsl(var(--muted) / 0.08)' : 'transparent' }}
  >
    <span className="absolute right-[50020px] top-1/2 -translate-y-1/2 text-xs text-muted-foreground/30 font-medium whitespace-nowrap">
      الجيل {data.genLabel}
    </span>
  </div>
);
```

## Enhancement 4: Filter Controls
**File: `src/hooks/useTreeLayout.ts`**
- Change signature: `useTreeLayout(expandedIds, _refreshKey?, filters?)`
- Accept `filters: { branch: string; gender: string; living: string }` parameter
- After building `visibleIds` set, if any filter is not `'all'`, filter down to matching members
- For filtered members, walk up `father_id` chains to keep ancestors visible (connected tree)
- Return `{ nodes, edges, totalCount, filteredCount }` (add counts)

**File: `src/components/FamilyTree.tsx`**
- Import `Filter` from lucide-react, `getBranch` is already imported, import `isDeceased` from familyService
- Add filter state:
  ```tsx
  const [filters, setFilters] = useState({ branch: 'all', gender: 'all', living: 'all' });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  ```
- Pass `filters` to `useTreeLayout(expandedIds, refreshKey, filters)`
- Add filter button after Layers button, same style (w-11 h-11)
- Show red dot badge when `activeFilterCount > 0`
- Filter dropdown panel (absolute positioned, RTL, 3 sections):
  - الفرع: الكل / فرع محمد / فرع ناصر / فرع عبدالعزيز (pill buttons with branch colors)
  - الجنس: الكل / ذكور / إناث
  - الحالة: الكل / أحياء / متوفون
  - إعادة تعيين button
- When filters active, show a subtle banner at top: "يتم عرض X من أصل Y فرد"

## Files Modified
1. `src/hooks/useTreeLayout.ts` — bezier edges, generation data, filters parameter
2. `src/components/FamilyCard.tsx` — generation badge
3. `src/components/FamilyTree.tsx` — generation bands, filter button/panel, filter banner
4. `src/components/GenerationBandNode.tsx` — new file for band node type

