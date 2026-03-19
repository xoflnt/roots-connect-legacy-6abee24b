

# Fix Font Loading — Eliminate FOUT

## Changes

### 1. `index.html` — Preload all 5 font weights
Currently only Regular and Bold are preloaded (lines 64-65). Add Medium, SemiBold, and Black. Move all 5 preloads right after the meta tags (before favicon links) for earliest possible fetch.

### 2. `src/index.css` — `font-display: block` + body opacity
- Change `font-display: swap` → `font-display: block` in all 5 `@font-face` declarations (lines 6, 14, 22, 30, 38)
- Add opacity transition to body rule (line 190-194):
  ```css
  body {
    font-family: 'YearOfHandicrafts', 'Tajawal', sans-serif;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  body.fonts-loaded { opacity: 1; }
  ```

### 3. `src/main.tsx` — Wait for fonts before render
Replace synchronous render with async init that awaits `document.fonts.ready`, then adds `fonts-loaded` class and renders:
```ts
async function init() {
  try { await document.fonts.ready; } catch {}
  document.body.classList.add('fonts-loaded');
  createRoot(document.getElementById('root')!).render(<App />);
}
init();
```

## Files
- `index.html` — add 3 missing preload links
- `src/index.css` — 5x `font-display: block` + body opacity rules
- `src/main.tsx` — async font-ready init

