

# Fix Horizontal Scroll Conflict in SmartNavigateView.tsx

## Problem
Swiping horizontally on the sons card row triggers the parent's sibling-navigation swipe handler, causing conflicts.

## Changes (single file: `src/components/tree/SmartNavigateView.tsx`)

### 1. Add `sonsScrollRef`
After the existing swipe refs (line ~260), add:
```ts
const sonsScrollRef = useRef<HTMLDivElement>(null);
```

### 2. Guard `handleTouchStart`
At the very start of `handleTouchStart` (line ~307), add early return if touch originates inside sons container:
```ts
if (sonsScrollRef.current?.contains(e.target as Node)) {
  swipeLocked.current = 'vertical';
  isSwiping.current = false;
  return;
}
```

### 3. Update sons scroll container (line ~568)
- Attach `ref={sonsScrollRef}`
- Add `overscroll-x-contain` to className
- Add `style={{ touchAction: 'pan-x', overscrollBehavior: 'contain' }}`

