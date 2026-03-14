

# Pure Canvas 2D Tree Export + Browserless Cleanup

## Overview
Replace the broken Browserless-based PDF export with a fully client-side solution using Canvas 2D + dagre (already installed). Delete all Browserless edge function code.

## Changes

### 1. CREATE `src/services/TreeCanvasExport.ts`
New file that renders the entire family tree on a Canvas using dagre for layout:
- Uses dagre to compute node positions (TB direction, same constants as the React Flow tree)
- Draws each member as a styled card (name, birth/death year, children count, deceased label, branch color stripe, gender dot)
- Draws bezier curve edges between parent-child nodes, colored by branch
- Supports `filterBranchId` to export a single branch
- Returns a PNG `Blob` at 2x scale for high resolution
- Loads Tajawal font for Arabic text rendering

### 2. REWRITE `src/services/TreeExportService.ts`
- Remove `supabase` import and all edge function invocation code
- Remove `adminToken` and `appUrl` parameters from `exportTreeAsPDF`
- New signature: `exportTreeAsPDF(_rfInstance, _expandAllFn, options: ExportOptions)`
- Dynamically imports `generateTreeCanvas` from `TreeCanvasExport.ts`
- Converts the returned Blob to a data URL, passes to existing `buildPDF()`
- Keep `buildPDF`, `drawCoverCanvas`, `coverRoundRect`, `loadTajawal` unchanged

### 3. UPDATE `src/pages/Admin.tsx`
- `handleTreeExport()`: Remove `getAdminToken()` call, remove `token` and `window.location.origin` args
- Update progress messages (remove server references)
- Update warning text: "٣٠-٦٠ ثانية" instead of "١٠-٣٠ ثانية"

### 4. DELETE `supabase/functions/export-tree-pdf/` (entire folder)
No longer needed — everything runs client-side.

### 5. REMOVE `html-to-image` from `package.json`
No longer used anywhere.

## Technical Notes
- dagre is already a dependency — no new packages needed
- The `Death_year` field uses capital D (matching `FamilyMember` interface)
- Canvas max size may be large for full tree (~400+ members), but modern browsers handle canvases up to ~16k px which is sufficient at 2x scale

