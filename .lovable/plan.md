

# Install "Year of Handicrafts" Font Family

## Files to modify

| File | Change |
|------|--------|
| `public/fonts/` | Copy 5 OTF files |
| `src/index.css` | Add 5 `@font-face` declarations + update body font |
| `tailwind.config.ts` | Add `fontFamily.sans` |
| `index.html` | Remove Google Fonts Tajawal links, add preload hints |
| `src/components/LineageShareCard.tsx` | Update `loadFont()` + all font strings + add tatweel |
| `src/components/kinship/KinshipShareCard.ts` | Update `loadFont()` + `setFont()` + all font strings |
| `src/components/LandingPage.tsx` | Tatweel on hero title |
| `src/components/AppHeader.tsx` | Tatweel on welcome text (line 122) |
| `src/components/ErrorBoundary.tsx` | Update inline `fontFamily` string |
| `src/components/SpouseCard.tsx` | Update inline `fontFamily` string |

## Implementation Details

### Step 1: Copy fonts to `public/fonts/`
Copy all 5 uploaded OTF files.

### Step 2: `src/index.css` — @font-face + body
Add 5 `@font-face` blocks at top (before `@tailwind`), weights 400/500/600/700/800. Update body `font-family` to `'YearOfHandicrafts', 'Tajawal', sans-serif`.

### Step 3: `tailwind.config.ts` — fontFamily
Add under `theme.extend`:
```
fontFamily: {
  sans: ['YearOfHandicrafts', 'Tajawal', 'Arial', 'sans-serif'],
}
```

### Step 4: `index.html`
- Remove the two Google Fonts `<link>` tags (preconnect + CSS)
- Add preload for Regular and Bold OTF files

### Step 5: Canvas components
**LineageShareCard.tsx**: Update `loadFont()` to load local OTF with `FontFace('YearOfHandicrafts', ...)` for weights 400+700. Replace all `Tajawal` references in font strings. Add `applyTatweel()` helper — inserts tatweel for names ≤4 chars. Apply to subject name and "◆ الخـنـيـنـي ◆". Use tatweel string for decorative separators.

**KinshipShareCard.ts**: Same `loadFont()` update. Update `setFont()` to replace with `'YearOfHandicrafts', 'Tajawal', 'Arial'`. All `Tajawal` strings in font declarations updated.

### Step 6: UI tatweel
**LandingPage.tsx** line 204: `"بوابة تراث الخنيني"` → `"بـوابـة تـراث الخـنـيـنـي"`

**AppHeader.tsx** line 122: `"مرحباً بك في بوابة تراث الخنيني"` — this is small body text, no tatweel per the rule. Only display headings get tatweel.

### Step 7: Inline fontFamily references
**ErrorBoundary.tsx** line 36: `"Tajawal, sans-serif"` → `"YearOfHandicrafts, Tajawal, sans-serif"`
**SpouseCard.tsx** line 14: `"'Tajawal', sans-serif"` → `"'YearOfHandicrafts', 'Tajawal', sans-serif"`

