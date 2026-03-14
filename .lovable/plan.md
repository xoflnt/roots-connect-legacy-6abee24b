

# Family Tree Map View — 4 Enhancements

## File 1: `src/hooks/useTreeLayout.ts`

**Mobile-responsive dimensions.** At top of `useTreeLayout`, detect mobile via `window.innerWidth < 768`. Use conditional dimensions for dagre graph and node positioning. Pass `isMobile` in each node's `data` object.

- Replace fixed constants usage inside `useMemo` with:
  ```
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const CARD_WIDTH = isMobile ? 155 : 220;
  const CARD_HEIGHT = isMobile ? 75 : 100;
  ```
- `g.setGraph({ rankdir: "TB", nodesep: isMobile ? 55 : 100, ranksep: isMobile ? 110 : 180 })`
- `g.setNode(member.id, { width: CARD_WIDTH, height: CARD_HEIGHT })`
- Node position: `x: pos.x - CARD_WIDTH / 2, y: pos.y - CARD_HEIGHT / 2`
- Add `isMobile` to each node's data object

## File 2: `src/components/FamilyCard.tsx`

**Mobile variant + React.memo.**

- Read `data.isMobile` from props
- When `isMobile`: container `w-[155px] min-h-[75px]`, name `text-sm line-clamp-1`, hide spouse names, mother name, birth/death years, WhatsApp/contact buttons, documenter/founder badges. Show only: name, verified badge, branch stripe, age (9px), children count (9px), deceased badge. Keep 44×44 expand button.
- When not mobile: keep everything exactly as-is
- Rename export to `FamilyCardComponent`, wrap with `React.memo` using custom comparator checking `id`, `isExpanded`, `hasChildren`, `selected`, `isMobile`, `isVerified`
- Export both named (`FamilyCard = React.memo(...)`) for backwards compat

## File 3: `src/components/FamilyTree.tsx`

**Three changes:**

1. **Remove auto fitView** — Line 74: remove `setTimeout(() => rfInstance.current?.fitView(...), 50)` from the `[layoutNodes, layoutEdges]` useEffect. Keep only `setNodes`/`setEdges`.

2. **Resize listener** — New useEffect to recompute layout on window resize:
   ```tsx
   useEffect(() => {
     const handleResize = () => setRefreshKey(k => k + 1);
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
   }, []);
   ```

3. **Multi-level expand** — Add `Layers` icon import. Add `showExpandMenu` state. Add `expandLevels(n)` callback that does BFS expansion for n levels (or all with confirm dialog), then calls fitView after 400ms. Add button after "أين أنا؟" in controls panel with an absolute-positioned dropdown showing 4 options. Dropdown closes on outside click via a backdrop div.

### Multi-level expand button + dropdown (inserted between LocateFixed button and MiniMap toggle):
```tsx
<div className="relative">
  <button onClick={() => setShowExpandMenu(v => !v)} ...>
    <Layers className="h-4 w-4" />
  </button>
  {showExpandMenu && (
    <>
      <div className="fixed inset-0 z-20" onClick={() => setShowExpandMenu(false)} />
      <div className="absolute bottom-full left-0 mb-2 bg-card border rounded-xl shadow-xl z-30 min-w-[160px]">
        <button onClick={() => { expandLevels(1); setShowExpandMenu(false); }}>توسيع جيل واحد</button>
        <button onClick={() => { expandLevels(2); setShowExpandMenu(false); }}>توسيع جيلين</button>
        <button onClick={() => { expandLevels(3); setShowExpandMenu(false); }}>توسيع ٣ أجيال</button>
        <button onClick={() => { expandLevels(999); setShowExpandMenu(false); }}>توسيع الكل ⚠️</button>
      </div>
    </>
  )}
</div>
```

### expandLevels function:
```tsx
const expandLevels = useCallback((n: number) => {
  if (n === 999) {
    if (!window.confirm('سيتم عرض جميع الأفراد. قد يبطؤ الجهاز. هل تريد المتابعة؟')) return;
    setExpandedIds(new Set(getAllMembers().map(m => m.id)));
  } else {
    setExpandedIds(prev => {
      const next = new Set(prev);
      let frontier = new Set(prev);
      for (let i = 0; i < n; i++) {
        const newFrontier = new Set<string>();
        for (const id of frontier) {
          const children = getChildrenOf(id);
          children.forEach(c => { next.add(id); newFrontier.add(c.id); });
        }
        frontier = newFrontier;
      }
      return next;
    });
  }
  setTimeout(() => rfInstance.current?.fitView({ duration: 600, padding: 0.15 }), 400);
}, []);
```

## Summary of All Changes
- **useTreeLayout.ts**: Mobile-aware dimensions (155×75 on mobile vs 220×100), tighter dagre spacing, `isMobile` flag in node data
- **FamilyCard.tsx**: Compact mobile variant hiding secondary info, React.memo with 6-field comparator
- **FamilyTree.tsx**: Removed auto-fitView on expand/collapse, added resize listener, added multi-level expand control with 4-option dropdown

