

# Two Actions

## 1. REVERT: Remove `!h-auto !inset-y-auto top-0` from SheetContent

**File**: `src/components/PersonDetails.tsx`, line 309

**Current**:
```
<SheetContent side="left" className="w-[360px] sm:w-[400px] !h-auto !inset-y-auto top-0 max-h-[92dvh] border-r-0 shadow-2xl overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
```

**Restore to**:
```
<SheetContent side="left" className="w-[360px] sm:w-[400px] max-h-[92dvh] border-r-0 shadow-2xl overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
```

## 2. SHOW: Current mobile Drawer JSX (lines 294-304)

```jsx
if (isMobile) {
  return (
    <Drawer open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="px-5 pb-[env(safe-area-inset-bottom,2rem)] pt-2 max-h-[92dvh] overflow-y-auto">
        <DrawerHeader className="p-0 mb-2">
          <DrawerTitle className="sr-only">{member.name}</DrawerTitle>
        </DrawerHeader>
        <DetailContent member={member} />
      </DrawerContent>
    </Drawer>
  );
}
```

That is the complete mobile Drawer block. No ScrollArea, no inner scroll div, no fixed height. `DrawerContent` has `max-h-[92dvh] overflow-y-auto` directly on it.

