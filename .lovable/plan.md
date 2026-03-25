

# Fix Search Dropdown Z-Index Stacking

## Problem
Search dropdown has `zIndex: 9999` but gradient (`z-[9]`) and wave (`z-10`) render on top because the search wrapper lacks its own stacking context.

## Changes — `src/components/LandingPage.tsx`

### 1. Hero content section (line 205)
`z-10` → `z-20`

### 2. Guest search wrapper (line 337)
Add `style={{ position: 'relative', zIndex: 9999 }}` to the outer div

### 3. Logged-in search section (line 448)
Change `z-10` → `z-20`, and add `style={{ position: 'relative', zIndex: 9999 }}` to inner wrapper (line 449)

### 4. Gradient fade (line 488)
`z-[9]` → `z-[5]`

### 5. SVG wave (line 494)
`z-10` → `z-[5]`

## Result
- Search dropdown: z-9999 (highest)
- Hero content: z-20
- Wave + gradient: z-5 (decorative, lowest)

