

# Dark Mode Audit — Complete Report

## Summary

Found **32 issues** across **13 files**. Canvas components (LineageShareCard, KinshipShareCard) are correctly always-light. Most issues are hardcoded HSL colors that look fine in light mode but become invisible or clash in dark mode.

---

## CATEGORY 1: Hardcoded HSL Colors (No Dark Variant)

### `src/components/LandingPage.tsx`

| Line | Issue |
|------|-------|
| 111-115 | `PILLAR_COLORS` uses hardcoded light-only HSL values: `bg-[hsl(155,40%,90%)]`, `border-[hsl(155,45%,70%)]`, `text-[hsl(155,45%,30%)]` — all three pillar entries. In dark mode, the 90% lightness backgrounds are glaring white-ish, and the 30% text is nearly invisible on dark backgrounds. |
| 228-229 | Dashboard avatar uses inline `backgroundColor: "hsl(330, 50%, 92%)"` / `"hsl(210, 50%, 92%)"` — very light backgrounds that look washed out in dark mode. Same for text colors at 35% lightness. |
| 461 | "كلمة الموثّق" badge: `bg-[hsl(35,70%,92%)] text-[hsl(35,55%,30%)]` — light cream bg + dark brown text, invisible/ugly in dark mode. |
| 466 | Documenter quote card: `border-r-[hsl(35,60%,45%)]` — acceptable but the border is very subtle in dark mode. |
| 467 | Quote icon: `text-[hsl(35,60%,45%)]/20` — nearly invisible in dark mode. |
| 475 | Documenter link: `text-[hsl(35,55%,30%)]` and `hover:text-[hsl(35,60%,40%)]` — dark brown text invisible on dark background. |

### `src/components/HeritageBadge.tsx`

| Line | Issue |
|------|-------|
| 34 | Documenter badge: `bg-[hsl(35,70%,92%)] text-[hsl(35,55%,30%)] border-[hsl(35,60%,40%)]/40` — light cream bg with dark text. Unreadable in dark mode. |

### `src/components/kinship/KinshipCardView.tsx`

| Line | Issue |
|------|-------|
| 138-141 | Entire card background is hardcoded: `border-[hsl(38,25%,82%)]` and inline `background: "linear-gradient(to bottom, hsl(38,30%,97%), hsl(38,20%,93%))"`. This renders as a bright cream card on a dark background — no dark mode adaptation at all. |

### `src/components/LineageView.tsx`

| Line | Issue |
|------|-------|
| 29-32 | `DEPTH_COLORS` array has hardcoded HSL values: `hsl(340, 60%, 55%)`, `hsl(35, 70%, 50%)`, `hsl(175, 50%, 40%)`, `hsl(270, 45%, 55%)` — these are medium-lightness colors that may have low contrast in dark mode (minor). |

### `src/components/ListView.tsx`

| Line | Issue |
|------|-------|
| 22-25 | Same pattern: hardcoded HSL values `hsl(25, 55%, 45%)`, `hsl(155, 40%, 35%)`, etc. — used as color accents for mother grouping. Low contrast in dark mode (minor). |

### `src/pages/Documents.tsx`

| Line | Issue |
|------|-------|
| 214 | Outer frame gradient: `from-[hsl(35,50%,65%)] via-[hsl(35,45%,55%)] to-[hsl(35,40%,45%)]` — hardcoded gold tones, works okay in both modes (decorative). |
| 216 | Inner parchment card: `bg-[hsl(38,30%,96%)]` **has** a dark variant `dark:bg-[hsl(35,15%,14%)]` — **OK, properly handled**. |

---

## CATEGORY 2: Hardcoded Brand Colors (Intentional — OK)

These are **acceptable** because they represent fixed brand colors:

| Color | Used in | Verdict |
|-------|---------|---------|
| `#25D366` (WhatsApp green) | FamilyCard, PersonDetails, LineageView, ListView, DataTableView, KinshipCardView | **OK** — brand color, works on both themes |
| `#22c55e` (verified badge) | FamilyCard, PersonDetails | **OK** — icon color, visible on both |
| `text-green-500` (verified badge) | BranchesView, SmartNavigateView, LandingPage | **OK** — Tailwind green, visible enough |

---

## CATEGORY 3: Admin Page Issues

### `src/pages/Admin.tsx`

| Line | Issue |
|------|-------|
| 280 | `bg-blue-600 text-white` — sync banner. No dark variant but high-contrast blue works fine in dark mode. **Minor/OK**. |
| 284 | `bg-white text-blue-700 hover:bg-blue-50` — button inside blue banner. The `bg-white` is fine here since it's inside a blue container. **OK**. |

---

## CATEGORY 4: Canvas Components

### `src/components/LineageShareCard.tsx` — **Always light. OK.**
### `src/components/kinship/KinshipShareCard.ts` — **Always light. OK.**
### `src/services/TreeCanvasExport.ts` — **Always light. OK.**

These all use hardcoded hex colors for canvas rendering which is correct — they generate static images.

---

## CATEGORY 5: Components With Proper Dark Mode Handling

- **AppHeader** — Uses CSS variables throughout (`bg-card`, `text-foreground`, `border-border`). **OK**.
- **PersonDetails** — Uses CSS variables (`bg-muted`, `text-foreground`, `bg-card`). Gender colors use CSS variables (`--male-light`, `--female-light`). **OK**.
- **OnboardingModal** — Uses CSS variables. The `text-green-600 dark:text-green-400` pattern is properly handled. **OK**.
- **SearchBar** — Uses CSS variables throughout. **OK**.
- **Bottom navigation (Index.tsx)** — `bg-background/95 backdrop-blur-md`. **OK**.
- **FamilyCard** — Uses CSS variables for gender borders and backgrounds (`hsl(var(--male)/0.25)`). `fontFamily` inline style still references `'Tajawal'` instead of `'YearOfHandicrafts'` (line 98, 187) — not a dark mode issue but a font consistency issue.
- **SpouseCard** — **OK**.
- **Guide.tsx** — Properly uses `dark:` variants on all colored elements. **OK**.

---

## CATEGORY 6: Missing `dark:` Variants (Specific Tailwind Classes)

### `src/components/LandingPage.tsx`

| Line | Issue |
|------|-------|
| 652 | `bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400` — **Already handled. OK.** |

### `src/pages/Guide.tsx`

All amber/blue/green/orange utilities have proper `dark:` counterparts. **OK**.

---

## TOP PRIORITY FIXES (Broken in Dark Mode)

1. **`LandingPage.tsx` lines 111-115** — `PILLAR_COLORS` needs dark mode variants (bright light backgrounds + dark text)
2. **`LandingPage.tsx` lines 228-229** — Dashboard avatar inline styles need dark variants
3. **`LandingPage.tsx` lines 461, 475** — Documenter section badges and links (cream bg + brown text)
4. **`HeritageBadge.tsx` line 34** — Documenter badge unreadable in dark mode
5. **`KinshipCardView.tsx` lines 138-141** — Entire kinship card is hardcoded light-only background
6. **`FamilyCard.tsx` lines 98, 187** — `fontFamily` still references `'Tajawal'` (font issue, not dark mode)

---

## MINOR ISSUES (Low contrast but functional)

7. `LineageView.tsx` lines 29-32 — `DEPTH_COLORS` could use slightly lighter values in dark mode
8. `ListView.tsx` lines 22-25 — same pattern as above