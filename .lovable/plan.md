

# Two Changes: Remove Font Size Toggle + Fix Tatweel

## Change 1: Remove Font Size Toggle

### Files to modify

**`src/contexts/FontSizeContext.tsx`** — Delete the file entirely.

**`src/components/FontSizeToggle.tsx`** — Delete the file entirely.

**`src/App.tsx`** — Remove `FontSizeProvider` import (line 7) and unwrap the `<FontSizeProvider>` / `</FontSizeProvider>` wrapper (lines 47, 69).

**`src/components/AppHeader.tsx`** — Remove `FontSizeToggle` import (line 4) and `<FontSizeToggle />` usage (line 136).

**`src/pages/Documents.tsx`** — Remove `FontSizeToggle` import (line 7) and `<FontSizeToggle />` usage (line 182).

**`src/components/LandingPage.tsx`** — Remove `FontSizeToggle` import (line 7) and `<FontSizeToggle />` usage (line 179). If the wrapper div becomes empty (only ThemeToggle remains), keep the div with just ThemeToggle.

**`src/index.css`** — Remove `font-size: var(--text-scale);` from body (line 193). Keep `html { font-size: 16px; }`. Remove any `--text-scale` variable if defined in `:root`.

---

## Change 2: Fix Tatweel Implementation

### `src/utils/tatweelUtils.ts` — Complete rewrite

Replace with proper Arabic connection rules using `NON_CONNECTING` set (ا أ إ آ ى د ذ ر ز و ة). Export both `applyTatweel(text)` for multi-word strings and `applyTatweelCanvas(name)` for single names. Minimum length threshold: 3 chars. Sacred exemptions: الله, الرحمن, الرحيم.

### `src/components/LineageShareCard.tsx` — lines 44-54

Remove the local `TATWEEL_EXEMPT` array and `applyTatweelCanvas` function. Import `applyTatweelCanvas` from `@/utils/tatweelUtils` instead. No other changes needed — the two call sites (lines 163, 264) already call `applyTatweelCanvas`.

### `src/components/tree/BranchesView.tsx` — No change needed

Already imports `applyTatweel` from `@/utils/tatweelUtils` (line 2). The new implementation is a drop-in replacement.

### Other callers

Search found no other files importing from `tatweelUtils`. The user mentioned AppHeader, LineageView, Guide, Documents as callers — but they don't currently use `applyTatweel`. No changes needed for those files unless they should start using it (not in scope).

