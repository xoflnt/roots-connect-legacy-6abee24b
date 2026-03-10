

# Premium Family Heritage Portal UI Upgrade

## Overview
Transform the raw canvas feel into an elegant, framed heritage portal with glassmorphism header, framed tree view, premium cards, and custom controls.

## Changes

### 1. `src/components/AppHeader.tsx` — Glassmorphism header with integrated search
- Redesign as a fixed, sticky top bar with `backdrop-blur-xl bg-white/70 dark:bg-[#0d1a2d]/70`
- Move `SearchBar` into the header (between title and theme toggle)
- Add `ResetViewButton` next to search
- Subtle bottom border with gradient or soft shadow
- Title with decorative accent

### 2. `src/pages/Index.tsx` — Framed layout
- Add body padding on desktop (`p-4 md:p-6`) below the header
- Wrap `FamilyTree` in a styled container with `rounded-3xl shadow-xl overflow-hidden border border-border/50` on desktop
- Show the background color around the frame for the "window" effect

### 3. `src/components/FamilyTree.tsx` — Clean canvas & custom controls
- Remove `<Background>` component entirely (use solid CSS background instead)
- Remove default `<Controls>` component
- Remove the floating search/reset bar (moved to header)
- Add custom zoom controls as floating pill buttons at bottom-right with `rounded-full shadow-lg`
- Set canvas background via CSS: cream `#FDFBF7` light / rich dark `#0f1729`
- Pass `handleSearch` and `handleReset` up via props or restructure

### 4. `src/components/FamilyCard.tsx` — Premium card design
- Change to `rounded-2xl` with soft borders (`border border-opacity-40`)
- Gradient background: `bg-gradient-to-b from-white to-[hsl(var(--male-light))]` (gender-based)
- Enhanced shadow: `shadow-sm hover:shadow-lg transition-all duration-300`
- Smoother selected state with `ring-offset-4`
- Add `antialiased` for text rendering

### 5. `src/index.css` — Add canvas background CSS variables
- Add `--canvas-bg: #FDFBF7` for light, `--canvas-bg: #0f1729` for dark
- Ensure smooth `antialiased` rendering globally

### Architecture Change
The search bar and reset button move from inside `FamilyTree` into `AppHeader`. This requires lifting `handleSearch` and `handleReset` to `Index.tsx` and passing them down, or using a ref-based approach. The simplest approach: expose search/reset callbacks from `FamilyTree` via `forwardRef`/`useImperativeHandle`, and pass them to `AppHeader`.

### File-by-file summary

| File | Action |
|------|--------|
| `src/index.css` | Add canvas CSS vars, antialiased |
| `src/pages/Index.tsx` | Add framing container, wire callbacks between header and tree |
| `src/components/AppHeader.tsx` | Glassmorphism, integrate SearchBar + ResetViewButton |
| `src/components/FamilyTree.tsx` | Remove Background/Controls/floating bar, add custom zoom buttons, expose search/reset via ref |
| `src/components/FamilyCard.tsx` | Premium gradient cards, rounded-2xl, enhanced shadows |
| `src/components/SearchBar.tsx` | Minor style tweaks for header integration |

