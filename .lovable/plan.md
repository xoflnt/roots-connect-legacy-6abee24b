

# Family Tree PDF Export — Implementation Plan

## Overview
Add a PDF export feature to the Admin panel using `html-to-image@1.11.11` + `jspdf@^2.5.1`. The flow: mount a hidden FamilyTree, expand all nodes, capture via `toPng`, build a 2-page PDF (cover + tree image), and save.

## Files to Modify/Create

### 1. `package.json` — Add dependencies
- `html-to-image`: `1.11.11` (exact — later versions broken per React Flow docs)
- `jspdf`: `^2.5.1`

### 2. `src/services/TreeExportService.ts` — NEW
Core export service:
- `exportTreeAsPDF(rfInstance, expandAllFn, options)` — orchestrates the flow
- Captures `.react-flow__viewport` via `toPng` at 2x pixel ratio
- `buildPDF()` creates a 2-page A2 landscape PDF:
  - **Page 1 (Cover)**: Cream background (#F7F3EE), gold accents, title "بوابة تراث الخنيني", branch label if specific, stats (member count, generations, branches), Hijri date
  - **Page 2 (Tree)**: Tree image fitted to page with margins, title, gold border
- Uses Tajawal font (loaded via FontFace API)
- Branch-aware: filters members by pillar ID when mode is 'branch'
- Imports `getBranch` from branchUtils, `getAllMembers` from familyService

### 3. `src/components/FamilyTree.tsx` — Extend ref API
Line 235: Update `useImperativeHandle` to expose:
- `expandAll()` — sets all member IDs as expanded (no confirm dialog)
- `getRfInstance()` — returns `rfInstance.current`

### 4. `src/pages/Admin.tsx` — Add export tab + UI
- Add third tab "تصدير الشجرة" to existing Tabs component
- New state: `exportMode`, `exportBranchId`, `exporting`, `exportProgress`, `showHiddenTree`
- Radio-style pill selectors for scope (full tree / 3 branches with color dots)
- Warning note about 10-30 second wait time
- Export button with spinner + progress text
- Hidden FamilyTree mounted off-screen (`left: -9999px`, `width: 1920px`, `height: 1080px`) only during export
- Flow: mount tree → wait 2s → expand all → wait 1.5s → capture → build PDF → unmount
- Import `FamilyTree`, `FamilyTreeRef`, `PILLARS` from branchUtils

## Technical Notes
- jsPDF's default font won't render Arabic perfectly — Tajawal loaded as custom font provides best results for cover page text
- The hidden tree approach avoids navigating away from Admin; conditional rendering keeps it lightweight
- A2 landscape (594×420mm) gives enough space for the full expanded tree at readable quality

