

# Add Subtle Background Image Behind Title Block

## Single file: `src/components/LandingPage.tsx`

### Lines 211-225 — Wrap title motion.div in a relative container

The current `motion.div` (lines 211-225) contains the TreePine icon, title, subtitle, and gold divider. Wrap it in a new `div` with the subtle background image.

**Current:**
```tsx
<motion.div
  className="max-w-lg mx-auto space-y-2 w-full relative z-10 mt-auto mb-6"
  ...
>
  <TreePine ... />
  <h1 ...>بـوابـة تـراث الخـنـيـنـي</h1>
  <p ...>فرع الزلفي</p>
  <div className="h-px bg-gradient-to-r ..." />
</motion.div>
```

**New:**
```tsx
<div className="relative w-full flex flex-col items-center text-center pt-8 pb-6 overflow-hidden rounded