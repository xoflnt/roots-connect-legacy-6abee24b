

# Fix Search Bar Visibility & Dropdown Stacking

## Problem
1. Search dropdown renders behind wave/gradient (z-[5] vs z-9999 — but hero `overflow-x-hidden` on line 184 may still clip)
2. Search input blends into hero background
3. Results need guaranteed solid background

## Changes — `src/components/LandingPage.tsx` + `src/index.css`

### 1. Boost search wrapper z-index (both locations)

**Guest search (line 337):** Change `zIndex: 9999` → `zIndex: 99999`

**Logged-in search (line 449):** Change `zIndex: 9999` → `zIndex: 99999`

**Both dropdowns (lines 353, 465):** Change `zIndex: 9999` → `zIndex: 99999` and add full inline styles:
```tsx
style={{
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 99999,
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  marginTop: '4px',
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
}}
```

### 2. Search input glass styling (both inputs)

**Guest input (line 346)** and **logged-in input (line 458):** Replace className/add inline style:
```tsx
className="pr-12 pl-4 h-14 text-base rounded-2xl hero-search"
style={{
  backgroundColor: 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1.5px solid rgba(255,255,255,0.6)',
  color: 'white',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
}}
```

### 3. Result item solid background

Both result buttons (lines 360, 472) — update inline style:
```tsx
style={{
  padding: '12px 16px',
  cursor: 'pointer',
  backgroundColor: 'hsl(var(--card))',
  borderBottom: '1px solid hsl(var(--border))',
  textAlign: 'right',
  fontSize: '16px',
  color: 'hsl(var(--foreground))',
  minHeight: 48,
}}
```

### 4. Placeholder CSS in `src/index.css`

Add under `@layer utilities`:
```css
.hero-search::placeholder {
  color: rgba(255,255,255,0.7);
}
```

### Files
- `src/components/LandingPage.tsx` — search input styling, dropdown z-index, result item styles
- `src/index.css` — placeholder color rule

