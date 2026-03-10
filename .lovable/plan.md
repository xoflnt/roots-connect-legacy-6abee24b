

# Fix Card Overlapping

The center-to-top-left offset is already correctly applied on line 32. The issue is just that the bounding box given to dagre is too small for the actual rendered card size with Arabic text wrapping.

## Changes in `src/hooks/useTreeLayout.ts`

1. **Line 6**: `NODE_WIDTH = 280` → `NODE_WIDTH = 350`
2. **Line 7**: `NODE_HEIGHT = 160` → `NODE_HEIGHT = 250`
3. **Line 12**: Update spacing: `nodesep: 150, ranksep: 250` → `nodesep: 200, ranksep: 300`

No other files need changes.

