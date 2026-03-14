

# Mobile Drawer Fix — PersonDetails.tsx

## Change

**File**: `src/components/PersonDetails.tsx`, lines 297-302

**Before**:
```jsx
<DrawerContent className="px-5 pb-[env(safe-area-inset-bottom,2rem)] pt-2 max-h-[92dvh] overflow-y-auto">
  <DrawerHeader className="p-0 mb-2">
    <DrawerTitle className="sr-only">{member.name}</DrawerTitle>
  </DrawerHeader>
  <DetailContent member={member} />
</DrawerContent>
```

**After**:
```jsx
<DrawerContent className="px-5 pt-2 flex flex-col" style={{ maxHeight: '92dvh' }}>
  <DrawerHeader className="p-0 mb-2">
    <DrawerTitle className="sr-only">{member.name}</DrawerTitle>
  </DrawerHeader>
  <div className="overflow-y-auto flex-1 pb-[calc(env(safe-area-inset-bottom)+24px)]">
    <DetailContent member={member} />
  </div>
</DrawerContent>
```

Moves scroll into an inner `flex-1` div, keeps `DrawerHeader` outside of scroll, uses inline `style` for `maxHeight`. Desktop Sheet untouched. No other files modified.

