

# Integrate LiquidGlass Component into App and LandingPage

## Files to modify
- `src/App.tsx` — add SVG filter import and render
- `src/components/LandingPage.tsx` — replace glass elements with LiquidGlass wrapper

---

## STEP 1: `src/App.tsx`

**Line 1**: Add import:
```tsx
import { LiquidGlassSVGFilter } from './components/LiquidGlass';
```

**Line 45**: Add `<LiquidGlassSVGFilter />` as first child inside `<ErrorBoundary>`:
```tsx
const App = () => (
  <ErrorBoundary>
    <LiquidGlassSVGFilter />
    <ThemeProvider>
    ...
```

## STEP 2: `src/components/LandingPage.tsx`

**Add import** at line 25 (with other component imports):
```tsx
import { LiquidGlass } from './components/LiquidGlass';
```

## STEP 3: Replace glass elements

### A) Main user dashboard card (line 271)
Replace the `motion.div` with `glass-premium` class — wrap its content with `<LiquidGlass level={3} borderRadius={24}>`. Remove `glass-premium` class and inline glass styles (`background`, `backdropFilter`, `WebkitBackdropFilter`). Keep `max-w-lg mx-auto p-4 space-y-4` classes and the motion props on the outer `motion.div`.

### B) Stats row cards (line 342) + Action buttons (line 361–372)
Each stats `motion.div` and action `motion.button` currently has `glass-base` class + inline overrides. Wrap inner content of each with `<LiquidGlass level={2} borderRadius={16}>`. Remove `glass-base` class and inline glass styles. Keep padding/layout classes and motion props on the outer element.

### C) Quick actions first row — الشجرة، النسب، القرابة (lines 491–493)
These are the first 3 items in the grid. Wrap each `motion.button` content with `<LiquidGlass level={1} borderRadius={14}>`. Remove `glass-base` and inline glass styles.

### D) Quick actions second row — تنقل، فروع، القائمة (lines 494–496)
Same treatment as C — `<LiquidGlass level={1} borderRadius={14}>`.

### E) Bottom buttons — أرسل طلب تعديل، دليل الاستخدام (lines 517–532)
Wrap each `<button>` with `<LiquidGlass level={1} borderRadius={12} as="button">`. Remove `glass-base` class and inline glass styles. Keep onClick, text, icons, and layout classes.

### F) Guest buttons — تصفح الشجرة، سجّل دخولك (lines 460–476)
Wrap each with `<LiquidGlass level={1} borderRadius={16}>`. Remove `glass-base` and inline glass styles.

---

## What stays unchanged
- All text colors, textShadow halos
- All onClick handlers and navigation logic
- All icons and labels
- Layout classes (padding, margin, grid, flex)
- Motion animation props (variants, whileHover, whileTap)

## What gets removed
- All inline `backdropFilter`, `WebkitBackdropFilter`, `background: rgba(...)` glass overrides
- `glass-base` and `glass-premium` CSS class references on replaced elements
- The LiquidGlass component now handles all glass styling internally

