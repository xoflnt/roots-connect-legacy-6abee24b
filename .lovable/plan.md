

# Fix PDF Export — Maximum Quality

## File 1: `src/services/TreeExportService.ts` — Full rewrite

Replace the entire file. Key changes:

1. **Canvas-based cover page** — Replace all `pdf.text()` calls (broken Arabic) with `drawCoverCanvas()` that renders the cover on Canvas 2D using Tajawal font with proper RTL support. The canvas is converted to PNG and embedded in the PDF as an image.

2. **CORS-safe tree capture** — Add `skipFonts: true` and a `filter` function to strip Google Fonts `<LINK>`/`<STYLE>` tags. Use `pixelRatio: 3` for maximum quality with a retry fallback at `pixelRatio: 2`.

3. **Quality-first timing** — `sleep(5000)` after expand, `sleep(2000)` after fitView, `sleep(2000)` before capture. Use `'SLOW'` compression in `pdf.addImage` for best quality.

4. **Cover design** — Cream gradient background, double gold border frame, dot pattern, tree icon, title/subtitle in Tajawal, branch pill with color coding, gold separator, stat boxes with `roundRect`, Hijri date, branding tagline.

## File 2: `src/pages/Admin.tsx` — 3 targeted edits

1. **Lines 220-227**: Replace timing block with quality-first waits (5000ms mount, 5000ms expand, 3000ms fitView settle) + explicit `rfInst.fitView()` call + better progress messages

2. **Lines 471**: Change hidden tree container to `4096×2160`, `left: -99999px`, add `pointerEvents: 'none'`, `userSelect: 'none'`, `overflow: 'hidden'`, `zIndex: -1`

