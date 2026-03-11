

# Fix Horizontal Scroll on Mobile (390px)

Multiple areas cause horizontal overflow on a 390px viewport. Here is a targeted fix for each.

## 1. Global overflow guard (`src/pages/Index.tsx`)
- Add `overflow-x-hidden` to the root wrapper div (line 36) and the landing page wrapper

## 2. LandingPage Stats (`src/components/LandingPage.tsx`)
- Stat card labels like `أكثر اسم للذكور: محمد` are long Arabic strings inside a 2-col grid at 390px with padding. Each card is ~170px but long labels overflow.
- Fix: Add `break-words` / `overflow-hidden` on StatCard, and wrap the label text. Also add `overflow-hidden` on the root `div`.

## 3. DataTableView Toolbar (`src/components/DataTableView.tsx`)
- Toolbar has `min-w-[200px]` search input + two `Select` components side by side — overflows at 390px.
- Fix: Make toolbar stack vertically on mobile: search full-width, selects wrap below. Remove `min-w-[200px]`, use `w-full` on mobile. Add `overflow-x-hidden` to the container.

## 4. ListView Deep Nesting (`src/components/ListView.tsx`)
- `paddingRight: ${Math.min(depth+1, 4) * 1}rem` — at depth 4, that's 4rem (64px) of right padding, leaving only ~310px for cards which should be fine, but combined with card internal padding could push content.
- Fix: Cap indentation more aggressively on mobile, e.g. `Math.min(depth+1, 3) * 0.75rem` for tighter nesting, and add `overflow-hidden` on the outer container.

## 5. LineageView Header (`src/components/LineageView.tsx`)
- Long names in header `نسب [full name]` could overflow.
- Fix: Add `break-words` and `overflow-hidden` on the view container.

## Files to Modify
1. `src/pages/Index.tsx` — add `overflow-x-hidden` to wrappers
2. `src/components/LandingPage.tsx` — `overflow-x-hidden` on root, `break-words` on stat labels
3. `src/components/DataTableView.tsx` — stack toolbar vertically on mobile, remove `min-w-[200px]`
4. `src/components/ListView.tsx` — tighter indentation, overflow guard
5. `src/components/LineageView.tsx` — `break-words` and overflow guard

