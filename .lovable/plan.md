

# Fix Search Dropdown Clipping with React Portal

## Problem
Line 176 has `overflow-hidden` on the hero container, creating a stacking context that clips the search dropdowns regardless of z-index.

## Solution
Use `createPortal` to render both search dropdowns (guest + logged-in) to `document.body`, escaping the overflow-hidden container.

## Changes — Single file: `src/components/LandingPage.tsx`

### 1. Add imports (line 1)
Add `createPortal` from `react-dom` and add refs for positioning:
```tsx
import { createPortal } from 'react-dom';
```
Add two refs in the component body:
```tsx
const guestSearchRef = useRef<HTMLDivElement>(null);
const loggedSearchRef = useRef<HTMLDivElement>(null);
```

### 2. Add scroll-close effect
Close dropdowns on scroll so portaled results don't drift:
```tsx
useEffect(() => {
  const h = () => setOpen(false);
  window.addEventListener('scroll', h, true);
  return () => window.removeEventListener('scroll', h, true);
}, []);
```

### 3. Guest search dropdown (lines 331-362)
- Attach `ref={guestSearchRef}` to the wrapper div (line 331)
- Replace the inline dropdown (lines 343-361) with a portal version that uses `getBoundingClientRect()` for fixed positioning at `zIndex: 99999`
- Each result item gets inline `backgroundColor` for solid opacity

### 4. Logged-in search dropdown (lines 440-471)
- Attach `ref={loggedSearchRef}` to the wrapper div (line 440)
- Same portal pattern as guest dropdown

### Portal dropdown template (used for