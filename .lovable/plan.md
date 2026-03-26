

# Add Adaptive Backdrop Behind Key Hero Text

## Changes — single file: `src/components/LandingPage.tsx`

### Approach

Create a reusable inline wrapper pattern that places a subtle frosted glass layer (`backdrop-filter: blur(4px)` + `rgba(0,0,0,0.15)`) behind text blocks. All existing text shadows remain untouched.

### 1. Title block (lines 226–240)

Wrap the `motion.div` children (TreePine + h1 + subtitle + divider) in a relative container with a pseudo-backdrop `div`:

```tsx
<div style={{ position: 'relative', isolation: 'isolate' }}>
  <div style={{
    position: 'absolute',
    inset: '-8px -16px',
    borderRadius: '12px',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    background: 'rgba(0,0,0,0.15)',
    zIndex: -1,
  }} />
  <TreePine ... />
  <h1 ...>بـوابـة تـراث الخـنـيـنـي</h1>
  <p ...>فرع الزلفي</p>
  <div className="h-px ..." />
</div>
```

### 2. Guest heading "اكتشف موقعك" (line 333)

Wrap the `<h2>` in the same pattern:

```tsx
<div style={{ position: 'relative', isolation: 'isolate', display: 'inline-block' }}>
  <div style={{ position: 'absolute', inset: '-6px -12px', borderRadius: '10px', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.15)', zIndex: -1 }} />
  <h2 ...>اكتشف موقعك في شجرة العائلة</h2>
</div>
```

### 3. No changes to card labels

Card labels already sit inside glass cards (`bg-white/15 backdrop-blur-sm`). Adding another backdrop layer would double-blur and look muddy. Skip per visual judgment.

### 4. All existing textShadow values remain exactly as they are

### Summary
- 2 backdrop wrappers added (title block + guest heading)
- No existing styles modified
- Subtle adaptive blur ensures readability against any background region

