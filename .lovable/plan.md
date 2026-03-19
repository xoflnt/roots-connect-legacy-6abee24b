

# Show Sync Diagnostics in Admin UI

## Changes (single file: `src/pages/Admin.tsx`)

### 1. Replace `handleSync` function (lines 189–207)
Replace with the user-provided version that:
- Shows "جاري المزامنة..." immediately
- Displays multi-line diagnostics: sent count, inserted count, orphans cleaned, success status, errors, missing fathers
- Uses `finally` to clear syncing state

### 2. Update syncResult display (line 292–294)
Change the `<span>` to a `<p>` (or keep `<span>` but add `whitespace-pre-wrap`) so line breaks render:
```
<span className="text-sm font-medium whitespace-pre-wrap">
```

