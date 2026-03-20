

# Replace Dagre with d3-hierarchy for Sibling Grouping

## Problem
Dagre positions nodes based on global edge-crossing minimization, causing siblings of the same parent to drift far apart when their subtrees differ in size. d3-hierarchy's `tree()` layout guarantees children are centered directly under their parent.

## Changes — Single file: `src/hooks/useTreeLayout.ts`

### 1. Install d3-hierarchy
Add `d3-hierarchy` and its types as dependencies.

### 2. Replace layout engine (lines 127-191)

Remove `dagre` import. Add `import { hierarchy, tree as d3tree } from "d3-hierarchy"`.

**Build hierarchy**: Find root members (no `father_id`). For each visible member, define children as visible members whose `father_id` matches, sorted by birth (via `sortByBirth`). If single root, build one hierarchy. If multiple roots, create a virtual root with the real roots as children.

**Configure tree layout**:
```ts
const treeLayout = d3tree<MemberType>()
  .nodeSize([CARD_WIDTH + NODE_SEP, CARD_HEIGHT + RANK_SEP])
  .separation((a, b) => a.parent === b.parent ? 1 : 1.5);
```

**Apply**: `treeLayout(root)` then read `node.x` (horizontal) and `node.y` (vertical) from `root.descendants()`.

### 3. Convert positions to nodes (lines 193-212)

Replace `g.node(member.id)` position lookup with a Map built from `root.descendants()`:
```ts
const posMap = new Map(root.descendants().map(d => [d.data.id, { x: d.x, y: d.y }]));
```

Then for each visible member:
```ts
position: { x: pos.x - CARD_WIDTH / 2, y: pos.y - CARD_HEIGHT / 2 }
```

### 4. Convert links to edges (lines 214-230)

Replace `g.edges()` with `root.links()`:
```ts
const edges = root.links()
  .filter(link => link.source.data.id !== '__virtual_root__')
  .map(link => {
    const edgeKey = `e-${link.source.data.id}-${link.target.data.id}`;
    const ci = edgeColorMap.get(edgeKey);
    const color = ci !== undefined ? BRANCH_COLORS[ci].stroke : "hsl(var(--muted-foreground) / 0.4)";
    return { id: edgeKey, source: link.source.data.id, target: link.target.data.id, type: "default", style: { stroke: color, strokeWidth: 2 }, animated: false };
  });
```

### 5. Preserve all existing logic
- Visibility expansion (lines 72-88) — unchanged
- Filter logic (lines 90-122) — unchanged
- Mother grouping and color assignment (lines 131-178) — unchanged, just no longer calls `g.setEdge`; instead populates `edgeColorMap` directly
- Spouse names (lines 180-189) — unchanged
- Node `data` payload (lines 199-210) — unchanged
- `BRANCH_COLORS`, helper functions, exports — unchanged

### 6. Handle multiple roots
The data has one primary root (id `"100"`). But if filters create disconnected visible members, wrap them under a virtual root node that gets excluded from final output.

### 7. Generation bands compatibility
`FamilyTree.tsx` reads `node.data.generation` (from `getDepth`) and `node.position.y` to build generation bands. d3-hierarchy's `y` values will be consistent per depth level, so bands will work correctly without changes.

## Technical Notes
- d3-hierarchy `tree()` with `nodeSize` centers children under parents by design — this directly solves the sibling drift
- `separation()` with `1