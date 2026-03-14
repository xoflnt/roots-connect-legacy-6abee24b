

# Improve النسب Tab — Always Show Sheet

## Changes

### 1. `src/pages/Index.tsx`
- Change `onViewChange` handler: for `"lineage"`, always call `setShowLineageSearch(true)` regardless of login status
- Rebuild the Sheet content:
  - Title: "نسب من؟" (`text-base font-bold text-right`)
  - If logged in, show shortcut card at top:
    - Get member via `getMemberById(currentUser.memberId)` for gender
    - `rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3`
    - Gender icon: `User` icon in `w-8 h-8 rounded-lg` with male/female color classes
    - Name + "عرض نسبي أنا" label + `ChevronLeft` arrow
    - On tap: navigate to `/person/${currentUser.memberId}`, close sheet
  - Separator text: "أو ابحث عن شخص آخر" (`text-xs text-muted-foreground text-center my-3`), only if logged in
  - Search input + results list (keep existing)

### 2. `src/pages/PersonPage.tsx`
- Change the `if (v === "lineage") return;` on line 51 to open the same sheet pattern — but since PersonPage doesn't have the sheet, simplest approach: navigate to `/?view=tree` then let Index handle it. Actually better: just navigate to `/?lineage=open` or simply re-tap should be a no-op since user is already on lineage. Keep `return;` — user is already viewing lineage.

### 3. `src/components/AppHeader.tsx`
- No changes needed (already has `isLineageActive` prop working)

### Files modified
- `src/pages/Index.tsx` — main sheet redesign
- `src/pages/PersonPage.tsx` — no change needed (already returns early on re-tap)

