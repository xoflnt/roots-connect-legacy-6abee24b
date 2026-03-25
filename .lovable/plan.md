

# Fix Search Dropdown Z-Index & Dark Mode Hero

## Changes — Single file: `src/components/LandingPage.tsx`

### FIX 1: Search Results Z-Index (4 locations)

**Guest search wrapper (line 328):** Wrap with `style={{ zIndex: 9999 }}`

**Guest dropdown (line 341):** Add inline `zIndex: 9999` and `backgroundColor` on each result item:
```tsx
<div className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden shadow-2xl border border-border"
  style={{ zIndex: 9999, backgroundColor: 'hsl(var(--card))' }}>
  {filtered.map((m) => (
    <button style={{ minHeight: 48, backgroundColor: 'hsl(var(--card))' }}
      className="w-full text-right px-4 py-3 text-foreground hover:bg-muted cursor-pointer border-b border-border last:border-0">
```

**Logged-in search wrapper (line 436):** Same `style={{ zIndex: 9999 }}`

**Logged-in dropdown (line 449):** Same treatment as guest dropdown.

### FIX 2: Dark Mode Hero (3 locations)

**Add dark mode overlay (after line 185, after `</picture>`):**
```tsx
<div className="absolute inset-0 dark:bg-black/50 bg-transparent pointer-events-none" />
```

**Main gradient overlay (line 191):** Replace hardcoded `rgba(246,243,238,1)` with CSS variable:
```tsx
background: `linear-gradient(to bottom,
  rgba(15,42,30,0.45) 0%,
  transparent 40%,
  rgba(15,42,30,0.55) 75%,
  hsl(var(--background)) 100%)`
```

**Wave fade gradient (line 473):** Same fix — replace hardcoded light color:
```tsx
background: `linear-gradient(to bottom,
  transparent 0%,
  hsl(var(--background) / 0.6) 50%,
  hsl(var(--background)) 100%)`
```

## Summary
- Lines 185-186: Insert dark mode overlay div
- Line 191: Use `hsl(var(--background))` instead of `rgba(246,243,238,1)`
- Lines 328, 341: Guest search — zIndex 9999, solid bg on items
- Lines 436, 449: Logged-in search — same treatment
- Line 473: Wave fade gradient — use CSS variable

