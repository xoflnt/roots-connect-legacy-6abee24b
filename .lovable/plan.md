

# Fix Glass Color Bleeding in LandingPage.tsx

## Problem
The `glass-base` and `glass-premium` CSS classes use `saturate(180-200%)` which amplifies the warm orange tones from the hero background image, making cards look amber instead of neutral glass.

## Approach
Override `glass-base`/`glass-premium` backdrop-filter values with inline styles on each element group, using reduced saturation and increased brightness/white-tint to neutralize the warm bleed. Keep the CSS classes for box-shadow/border structure but override the key properties inline.

## Changes — single file: `src/components/LandingPage.tsx`

### FIX 1: Main user card (line 271)
Add inline style to the `glass-premium` div:
```tsx
style={{
  background: 'rgba(255, 255, 255, 0.28)',
  backdropFilter: 'blur(16px) saturate(140%) brightness(115%)',
  WebkitBackdropFilter: 'blur(16px) saturate(140%) brightness(115%)',
}}
```

### FIX 2: Stats row cards (line 341) + Action buttons (line 366)
Add inline style overrides to each `glass-base` element inside the dashboard card:
```tsx
style={{
  background: 'rgba(255, 255, 255, 0.22)',
  backdropFilter: 'blur(12px) saturate(130%) brightness(112%)',
  WebkitBackdropFilter: 'blur(12px) saturate(130%) brightness(112%)',
}}
```

### FIX 3: Quick actions grid items (line 501)
Add inline style to each grid button:
```tsx
style={{
  background: 'rgba(255, 255, 255, 0.20)',
  backdropFilter: 'blur(10px) saturate(130%)',
  WebkitBackdropFilter: 'blur(10px) saturate(130%)',
}}
```

### FIX 4: Bottom buttons (lines 515, 523)
Add inline style to both buttons:
```tsx
style={{
  background: 'rgba(255, 255, 255, 0.18)',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  backdropFilter: 'blur(10px) saturate(130%)',
  WebkitBackdropFilter: 'blur(10px) saturate(130%)',
  color: 'rgba(255, 255, 255, 0.95)',
}}
```
Merge with existing textShadow style objects.

### FIX 5: Guest buttons (lines 461, 469)
Same treatment as bottom buttons — add inline backdrop-filter overrides with reduced saturation.

### Summary
| Element | saturate | blur | bg opacity |
|---------|----------|------|------------|
| Main card | 140% | 16px | 0.28 |
| Stats/actions | 130% | 12px | 0.22 |
| Quick grid | 130% | 10px | 0.20 |
| Bottom/guest btns | 130% | 10px | 0.18 |

Key principle: reducing `saturate` from 180% to 130-140% stops the orange amplification. Increasing white opacity compensates for visual depth.

