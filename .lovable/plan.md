

# Fix Hero Glass Section — 3 Fixes

## Problem
1. Logged-in search bar (lines 451-486) is **outside** the hero glass container (which ends at line 449)
2. Dashboard card already has glass styling but branch badge uses theme colors instead of white
3. Wave transition is abrupt (single SVG, h-12)

## Changes — Single file: `src/components/LandingPage.tsx`

### Fix 1: Move search bar inside glass area

Move the logged-in search section (lines 451-486) **inside** the hero `<div>` container, placing it after the "Bottom action buttons" section (after line 441) and before the SVG wave (line 443). Apply glass styling to the input:

```tsx
// Inside the hero container, after bottom action buttons, before SVG wave
{currentUser && (
  <section className="relative z-10 px-4 pb-4">
    <div className="max-w-lg mx-auto relative z-20">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none" />
        <Input
          placeholder="ابحث عن أي فرد في العائلة..."
          ...same handlers...
          className="pr-12 pl-4 h-12 text-base rounded-2xl backdrop-blur-md bg-white/15 border border-white/30 text-white placeholder:text-white/60 shadow-lg focus:ring-2 focus:ring-accent"
        />
      </div>
      {/* Results dropdown stays same (bg-card) */}
    </div>
  </section>
)}
```

Delete the old search section outside the hero (lines 451-486).

### Fix 2: Glass treatment for dashboard card

The card container (line 238) already has glass styling. Fix the branch badge (lines 261-269) to use glass colors instead of theme-specific colors:

```tsx
<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
  {dashboardData.branch.label}
</span>
```

Also fix the avatar container (lines 246-249) to use glass colors:
```tsx
className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/15 text-white"
```

### Fix 3: Smoother wave transition

Before the SVG wave (line 443), add a gradient fade div. Reduce SVG wave from `h-12` to `h-8`:

```tsx
{/* Gradient fade before wave */}
<div className="absolute bottom-0 left-0 right-0 h-32 z-[9]"
  style={{
    background: 'linear-gradient(to bottom, transparent 0%, rgba(246,243,238,0.6) 50%, rgba(246,243,238,1) 100%)'
  }}
/>
{/* SVG wave */}
<div className="absolute bottom-0 left-0 right-0 overflow-hidden z-10">
  <svg viewBox="0 0 1440 60" className="w-full h-8 fill-background" preserveAspectRatio="none">
    <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" />
  </svg>
</div>
```

## Summary of line changes
- Lines 443-448: Add gradient fade div + reduce wave to h-8
- Lines 246-269: Glass colors for avatar + branch badge
- Lines 451-486: Delete (moved inside hero container, inserted before wave)

