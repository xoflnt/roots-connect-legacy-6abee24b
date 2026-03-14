

# Create Browserless.io Edge Function for PDF Export

## Overview
Create a new edge function `export-tree-pdf` that uses Browserless.io headless Chrome to capture the family tree at maximum quality. Update `TreeExportService.ts` to call this edge function instead of using `html-to-image`. Simplify `Admin.tsx` by removing the hidden tree infrastructure.

## File 1: `supabase/functions/export-tree-pdf/index.ts` (NEW)

Edge function that:
- Validates admin token via `admin_sessions` table (same pattern as `family-api`)
- Receives `{ mode, branchId, branchLabel, appUrl }` from client
- Calls Browserless.io `/screenshot` endpoint with:
  - 3840x2160 viewport, `deviceScaleFactor: 2`
  - An `evaluate` script that sets the admin session in `sessionStorage`, navigates to the tree view, expands all nodes, fits view, then signals readiness via `document.title`
  - `waitForFunction` polling for `document.title === 'READY_FOR_EXPORT'` with 120s timeout
  - `networkidle2` wait strategy
- Returns screenshot as base64 JSON response
- CORS headers include `x-admin-token`

## File 2: `supabase/config.toml` (UPDATE)

Add:
```toml
[functions.export-tree-pdf]
verify_jwt = false
```

## File 3: `src/services/TreeExportService.ts` (UPDATE)

- Remove `toPng` import and all html-to-image capture logic
- Add `supabase` client import
- Change `exportTreeAsPDF` signature to accept `adminToken` and `appUrl` params (remove `rfInstance` and `expandAllFn`)
- New flow: call `supabase.functions.invoke('export-tree-pdf', ...)` with admin token header, then pass returned base64 screenshot to existing `buildPDF()`
- Keep `buildPDF()`, `drawCoverCanvas()`, `coverRoundRect()`, `loadTajawal()`, `sleep()` unchanged

## File 4: `src/pages/Admin.tsx` (UPDATE)

- Remove: `showHiddenTree` state, `hiddenTreeRef` ref, hidden `<FamilyTree>` component, `FamilyTree`/`FamilyTreeRef` imports
- Simplify `handleTreeExport()`: get admin token, call `exportTreeAsPDF(null, () => {}, options, token, window.location.origin)`, show progress messages
- No more mount/expand/fitView orchestration — Browserless handles it all server-side

## Security
- Admin token validated server-side before Browserless call
- `BROWSERLESS_API_KEY` already added as a secret
- `verify_jwt = false` with manual token validation (matches existing pattern)

