

# Fix Browserless v1 → v2 API Migration

## Problem
The Browserless fetch call on lines 134-169 uses v1 fields (`evaluate`, `waitFor`, `waitForFunction`) which are rejected by the v2 API.

## Change: Lines 133-169

Replace the fetch call with v2 API:
- **Endpoint**: `/chromium/screenshot` instead of `/screenshot`
- **`addScriptTag`**: Replaces `evaluate` — wraps the automation script in an IIFE injected via `addScriptTag[].content`
- **`waitForTimeout: 5000`**: Replaces `waitFor` — final buffer after script completes
- **`waitForSelector`**: Waits for `.react-flow__viewport` before screenshot (replaces `waitForFunction`)
- **`gotoOptions`**: Kept with `networkidle2` and increased timeout to 60s
- Keep `viewport`, `options.clip` dimensions unchanged (3840×2160, scale 2)

The automation script content stays the same (set sessionStorage, expand nodes, fit view, set document.title) but is wrapped in `(async function() { ... })()` inside `addScriptTag`.

No other lines in the file change.

