

# One-Line Fix: PersonDetails SheetContent

## Change

**File**: `src/components/PersonDetails.tsx`, line 309

**Before**:
```
<SheetContent side="left" className="w-[360px] sm:w-[400px] max-h-[92dvh] border-r-0 shadow-2xl overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
```

**After**:
```
<SheetContent side="left" className="w-[360px] sm:w-[400px] !h-auto !inset-y-auto top-0 max-h-[92dvh] border-r-0 shadow-2xl overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
```

Added `!h-auto !inset-y-auto top-0` to override the `side="left"` variant's forced `h-full inset-y-0`, allowing the sheet to hug its content naturally.

No other files modified.

