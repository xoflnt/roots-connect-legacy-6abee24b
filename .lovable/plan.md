

# Two Fixes in LandingPage.tsx

## FIX 1: Remove backdrop boxes

Remove both backdrop wrapper divs that create visible boxes behind text:

**Title block (lines 232–250):** Remove the outer `<div style={{ position: 'relative', isolation: 'isolate' }}>` wrapper and its absolute backdrop child div. Keep TreePine, h1, p, and divider as direct children of the `motion.div`.

**Guest heading (lines 344–357):** Same — remove the wrapper and backdrop div, keep the `<h2>` directly. All text shadows remain untouched.

## FIX 2: Colored glass branch badge

**Line 277** — the dashboard branch badge currently:
```tsx
<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
  {dashboardData.branch.label}
</span>
```

Replace with a styled span using `dashboardData.branchStyle` (already available — contains `bg` and `text` hex colors from `getBranchStyle()`). The branch hex colors are:
- Nasser (300): `#16a34a`
- Mohammad (200): `#C9A84C`
- Abdulaziz (400): `#ea580c`

`branchStyle.text` holds the saturated color. Use it for tinted glass:

```tsx
<span
  className="text-[10px] font-bold px-3 py-0.5 rounded-full border"
  style={{
    backgroundColor: `${dashboardData.branchStyle.text}33`,
    borderColor: `${dashboardData.branchStyle.text}66`,
    color: 'white',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  }}
>
  {dashboardData.branch.label}
</span>
```

Wait — `branchStyle` uses HSL strings like `hsl(155 45% 30%)`, not hex. Need to map pillar IDs to hex colors instead. Use `dashboardData.branch.pillarId` to pick from a local map:

```ts
const BRANCH_HEX: Record<string, string> = {
  '300': '#16a34a',
  '200': '#C9A84C',
  '400': '#ea580c',
};
const branchHex = BRANCH_HEX[dashboardData.branch.pillarId] || '#C9A84C';
```

Then use `branchHex` in the style.

### Technical details

| Location | Action |
|----------|--------|
| Lines 232–250 | Remove wrapper div + backdrop div, keep inner content |
| Lines 344–357 | Remove wrapper div + backdrop div, keep `<h2>` |
| Line 277 | Replace plain badge with colored glass badge using hex branch colors |
| Near line 114 | Add `BRANCH_HEX` map constant |

Single file: `src/components/LandingPage.tsx`

