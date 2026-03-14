

# KinshipCalculator Full Redesign

## Overview
5 changes: delete InteractiveView, create CardView with sharing, upgrade TreeView with interactivity, add URL deep linking, and full visual redesign of the calculator page.

## Files Modified/Created/Deleted

| Action | File |
|--------|------|
| **Delete** | `src/components/kinship/KinshipInteractiveView.tsx` |
| **Create** | `src/components/kinship/KinshipCardView.tsx` |
| **Edit** | `src/components/KinshipCalculator.tsx` |
| **Edit** | `src/components/kinship/KinshipTreeView.tsx` |
| **Edit** | `src/components/kinship/KinshipDocumentView.tsx` (remove duplicate `toArabicNum`) |
| **Edit** | `src/components/kinship/types.ts` (add `onPersonTap` callback) |
| **Install** | `html2canvas` package |

## Change 1: Delete KinshipInteractiveView

Remove the file entirely. Remove its import and "المسار" tab from KinshipCalculator.

## Change 2: KinshipCardView.tsx (new file)

A shareable heritage card component. Key sections:

- **Card container** (`cardRef` for screenshot): parchment gradient background (`hsl(38,30%,97%)` → `hsl(38,20%,93%)`), gold top/bottom lines, `rounded-2xl shadow-lg p-6 dir="rtl"`.
- **Header**: "صلة القرابة" pill with Users icon, relationship title `text-2xl font-extrabold`, directional descriptions if asymmetric.
- **Two person chips**: `flex flex-row-reverse gap-3`, each with gender icon (w-10 h-10 rounded-xl, male/female colors), full name, branch badge via `getBranch()`/`getBranchStyle()`. Person1: `border-primary/30`, Person2: `border-accent/50`. Each tappable → calls `onPersonTap(member)`.
- **Common ancestor**: dashed border box, "يجتمعان في" label, LCA name (tappable), "الجد المشترك" label.
- **Distance badges**: two equal `rounded-xl bg-muted/50` boxes, person first name, distance in Arabic numerals (`text-3xl font-extrabold`), "أجيال" label.
- **Path chain**: horizontal scroll of `rounded-full` pills connected by ChevronLeft icons. Person1/2 pills: `bg-primary/15`, LCA pill: `bg-accent/15 ring-1 ring-accent/30`, intermediates: `bg-muted`. Each tappable → `onPersonTap`.
- **Footer** (inside cardRef): "بوابة تراث الخنيني — فرع الزلفي" centered text-xs.
- **Share buttons** (outside cardRef):
  - WhatsApp: `bg-[#25D366] text-white rounded-2xl w-full min-h-[52px]`. Lazy-imports `html2canvas`, captures `cardRef`, uses `navigator.share({ files })` on mobile or downloads PNG on desktop. Loading spinner state.
  - Copy link: outline button, copies URL with `?view=kinship&p1=id&p2=id`, shows "تم النسخ ✓" for 2s via state toggle.

Props: extends `KinshipViewProps` + `onPersonTap: (m: FamilyMember) => void` + `relationText: string` + `directional: DirectionalKinship | null`.

## Change 3: Upgrade KinshipTreeView

- Add `onPersonTap` to `KinshipViewProps` in `types.ts`.
- Every person node becomes a `<button>` calling `onPersonTap(member)`.
- Gender border: `border-l-2` with `hsl(var(--male))` or `hsl(var(--female))` based on `m.gender`.
- Person1 node: `ring-2 ring-primary/40`.
- Person2 node: `ring-2 ring-accent/40`.
- LCA node: CSS animation `animate-pulse` for 3s then stop (via `useState` + `setTimeout`).
- Deceased members: `opacity-70` + `HeritageBadge` type="deceased".
- Import `HeritageBadge`, `isDeceased`, `getMemberById` as needed.

## Change 4: URL Deep Linking

In `KinshipCalculator.tsx`:
- Import `useSearchParams` from react-router-dom.
- On mount: read `p1` and `p2` from search params. If both valid member IDs, auto-fill `person1`/`person2` and set `showResult = true`.
- When both persons selected and result shown: call `window.history.replaceState(null, '', '?view=kinship&p1=${id1}&p2=${id2}')` to update URL silently.

## Change 5: Full Visual Redesign of KinshipCalculator

### Page header
- Badge pill: `GitBranch` icon + "حاسبة القرابة", `bg-primary/10 text-primary rounded-full px-4 py-1.5`.
- Subtitle: "اكتشف صلة القرابة بين أي فردين في العائلة", `text-sm text-muted-foreground`.
- `animate-fade-in`.

### Person pickers redesign
Each picker becomes a card: `rounded-2xl border bg-card/80 backdrop-blur-sm p-4 shadow-sm`.
- **Empty state**: dashed border input with Search icon placeholder.
- **Selected state**: gender icon (w-10 h-10 rounded-xl, male/female colors), full name `text-base font-bold`, branch badge + generation badge (`HeritageBadge type="generation"`), gender-tinted background (`bg-[hsl(var(--male-light))]/30` or female), "تغيير" button top-left clears selection.
- Search dialog/dropdown stays as-is internally.

### Swap button
Pill button: "⇄ تبديل" `rounded-full bg-muted px-4 py-2 text-sm`, centered between cards.

### Calculate button
- Full width `min-h-[52px] rounded-2xl`.
- Ready: `bg-primary shadow-md` with `GitBranch` icon + "احسب القرابة".
- Not ready: `bg-muted text-muted-foreground cursor-not-allowed`.

### Result card header
- Top gold gradient line.
- Centered relationship title `text-xl font-extrabold`.
- Two person names with `←→` connector, each colored (primary / accent).
- `animate-fade-in`.

### Tabs redesign
3 tabs: المخطط | الوثيقة | البطاقة (icons: TreePine, FileText, Share2).
- Container: `rounded-2xl bg-muted p-1`.
- Active: `bg-card shadow-sm rounded-xl font-bold`.
- Default active: "card" (البطاقة).

### PersonDetails integration
- Add `detailMember` state + `setDetailMember` in KinshipCalculator.
- Pass `onPersonTap={setDetailMember}` to all three view components.
- Render `<PersonDetails member={detailMember} onClose={() => setDetailMember(null)} />` at bottom.

### KinshipDocumentView cleanup
- Remove the local `toArabicNum` function (lines 5-7), import from `@/utils/ageCalculator` or use inline `n.toLocaleString("ar-SA")`.

## Dependencies
- `html2canvas`: install via package.json. Used only via lazy `import()` in KinshipCardView share handler — zero bundle impact until user taps share.

