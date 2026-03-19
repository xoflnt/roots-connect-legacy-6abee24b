

# Simplify Font Size Toggle — CSS Variable on Body

## Problem
The current CSS class approach (`.fs-large p, .fs-large span, .fs-large div...`) with `!important` is too aggressive, cascading `calc(1em * 1.15)` into every nested element and compounding the scaling.

## Solution
Set `--text-scale` CSS variable on `:root`, apply it only to `body { font-size: var(--text-scale) }`. Text inherits naturally; rem-based spacing stays fixed at 16px.

## Changes

### File 1: `src/contexts/FontSizeContext.tsx`
- Remove `ALL_CLASSES` and all `classList` manipulation
- Remove `root.style.fontSize = ""`
- Replace with `root.style.setProperty('--text-scale', scales[level])`
- Scales: normal=`1rem`, large=`1.125rem`, xlarge=`1.25rem`

### File 2: `src/index.css`
- Keep `html { font-size: 16px }` unchanged
- Add `:root { --text-scale: 1rem; }` and `body { font-size: var(--text-scale); }`
- **Delete** lines 212–243 (all `.fs-normal`, `.fs-large`, `.fs-xlarge`, `.font-scale-exempt` rules)

### File 3–7: Remove `font-scale-exempt` class from 5 files
| File | What to revert |
|------|---------------|
| `src/pages/Index.tsx` line 283 | Remove `font-scale-exempt` from span class |
| `src/components/AppHeader.tsx` line 88 | Remove `font-scale-exempt` from div class |
| `src/components/OnboardingModal.tsx` line 480 | Remove `font-scale-exempt` from div class |
| `src/components/HeritageBadge.tsx` line 55 | Remove `font-scale-exempt` from Badge class |
| `src/components/tree/BranchesView.tsx` line 208 | Remove `font-scale-exempt` from button class |
| `src/components/FontSizeToggle.tsx` line 23 | Remove `font-scale-exempt` from span class |

