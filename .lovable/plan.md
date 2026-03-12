

# Fix: Search Not Finding "عبدالله علي"

## Root Cause (Two Bugs)

**Bug 1:** `SearchBar.tsx` has its own inline search filter (line 30) that does exact substring matching instead of calling the tokenized `searchMembers()` from `familyService.ts`. The tokenized search was added but SearchBar was never updated to use it.

**Bug 2:** In `normalizeForSearch()`, the regex `\b(بن|بنت|ابن)\b` uses `\b` which is a Latin-only word boundary in JavaScript. It never matches Arabic text, so "بن" is never stripped. This means "عبدالله بن علي" stays unchanged after normalization.

Combined effect: searching "عبدالله علي" looks for the exact substring in "عبدالله بن علي" — fails because "بن" is still there.

## Fix

### 1. Fix Arabic word boundary in `normalizeForSearch` (`src/services/familyService.ts`)
Replace `\b` with space-aware pattern:
```typescript
.replace(/(^|\s)(بن|بنت|ابن)(\s|$)/g, " ")
```

### 2. Update `SearchBar.tsx` to use `searchMembers()`
Replace the inline filter on line 27-32 with a call to `searchMembers(query)` from familyService, so both search surfaces use the same tokenized logic.

**Files:** `src/services/familyService.ts`, `src/components/SearchBar.tsx`

