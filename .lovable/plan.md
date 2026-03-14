

# Replace html2canvas with Canvas 2D in KinshipCardView

## Summary

Three changes: create a new `generateKinshipImage()` function, rewire the share handler, add font preloading to `LineageShareCard.tsx`, and remove `html2canvas` from `package.json`.

## Files Changed

### 1. NEW: `src/components/kinship/KinshipShareCard.ts`

Pure Canvas 2D drawing function following the user's exact spec:
- `generateKinshipImage(result, person1, person2, relationText, directional, pathChain)` returns `Promise<HTMLCanvasElement>`
- Loads Tajawal font via `FontFace` API before drawing
- Uses hardcoded colors only (no CSS variables)
- Canvas: 390 logical px wide, 3x scale (1170px actual), dynamic height
- Drawing sections in order: background, gold lines, header badge + relation text, directional titles, two person chips with gender icons and branch pills, dashed LCA ancestor box, two distance badges with Arabic-Indic numerals, RTL-wrapping path chain pills with arrow separators, footer separator and branding
- Branch color mapping: `"200"` → `#C9A84C`, `"300"` → `#16a34a`, `"400"` → `#ea580c`

### 2. EDIT: `src/components/kinship/KinshipCardView.tsx`

- Remove `cardRef`, `captureCard`, `html2canvas` import
- Import `generateKinshipImage` from `./KinshipShareCard`
- Replace `handleShare`: call `generateKinshipImage(...)`, get blob from returned canvas, then native share → fallback sheet (same flow, just different image source)
- Replace `handleDownloadPng`: generate fresh image if no blobUrl cached
- Keep the visible card JSX unchanged (it's the interactive UI, not the export)
- Keep the fallback Sheet with download/WhatsApp/copy buttons

### 3. EDIT: `src/components/LineageShareCard.tsx`

Add FontFace loading before drawing:
```ts
const font = new FontFace('Tajawal',
  'url(https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.woff2)');
await font.load();
document.fonts.add(font);
```

### 4. EDIT: `package.json`

Remove `"html2canvas": "^1.4.1"` from dependencies.

## Technical Notes

- The visible card in the DOM remains as-is (interactive buttons, CSS-variable styling). Only the **exported image** changes from screenshot to manual draw.
- Path chain wrapping: measure each pill text width with `ctx.measureText()`, start from right edge, wrap to next row when x < left margin.
- Arabic-Indic digits: `n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d])`
- Person icon drawn as simple circle (head) + arc (shoulders) — no external SVG needed.

