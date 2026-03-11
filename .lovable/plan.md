

# Mobile-First Optimization Plan

## Overview
Transform the portal into a native-feeling mobile experience with a bottom navigation bar, collapsible search, proper touch targets, and responsive spacing across all components.

## Changes

### 1. `src/components/AppHeader.tsx` — Bottom Nav on Mobile
- On mobile (`< md`): Replace the inline segmented control with a **fixed Bottom Navigation Bar** at the bottom of the screen, showing 4 icons (Tree, Lineage, List, Table) with labels underneath. Active tab highlighted with primary color.
- Top header on mobile becomes minimal: just the logo, home button, search icon, and theme toggle.
- **Search icon** on mobile opens a full-screen search overlay (modal-style) instead of inline input.
- On desktop (`md+`): Keep current layout unchanged.

### 2. `src/components/SearchBar.tsx` — Icon-only on Mobile
- Add a `compact` prop or use `useIsMobile()`.
- On mobile: render only a 44x44 search icon button. Tapping opens a `Dialog` or full-width overlay with the search input and results list.
- On desktop: keep current inline input behavior.

### 3. `src/components/FamilyCard.tsx` — Touch Targets
- Expand the `(+)`/`(-)` toggle button from `w-7 h-7` to `min-w-[44px] min-h-[44px]` (visual size can stay small via inner icon, but hit area must be 44px).

### 4. `src/components/PersonDetails.tsx` — Already Good
- Already uses Drawer on mobile and Sheet on desktop. The Drawer component already has a drag handle pill. No changes needed here.

### 5. `src/components/LandingPage.tsx` — Mobile Polish
- Hero title: `text-3xl md:text-6xl` (slightly smaller on mobile).
- Hero icon: `w-16 h-16 md:w-20 md:h-20`.
- CTA button: Add `w-full md:w-auto` to be full-width on mobile.
- About section: `py-12 md:py-20`, text `text-base md:text-lg`.
- Search input height: Keep `h-14` but ensure dropdown results have 48px min-height (already there).

### 6. `src/components/ListView.tsx` — Touch Targets
- Ensure list items have `min-h-[52px]` (already at 52, good).
- Expand chevron area: wrap in 44x44 container. Already `w-5 h-5`, needs to be `min-w-[44px] min-h-[44px]`.

### 7. `src/pages/Index.tsx` — Bottom Nav Space
- Add `pb-16 md:pb-0` to main content area when not on landing to account for the fixed bottom nav bar on mobile.

### 8. `src/components/ThemeToggle.tsx` — Compact on Mobile
- Make it icon-only on mobile (hide text label), keep full on desktop.
- Ensure 44x44 touch target.

### 9. `src/components/ResetViewButton.tsx` — Compact on Mobile
- Icon-only on mobile, full button on desktop.

## Architecture: Bottom Navigation

```text
Mobile Layout:
┌──────────────────┐
│ [🏠] آل الخنيني [🔍][🌙] │  ← slim top bar
├──────────────────┤
│                  │
│   Main Content   │
│                  │
├──────────────────┤
│ 🌳  📊  📋  📊  │  ← fixed bottom nav
│ الشجرة النسب القوائم البيانات │
└──────────────────┘

Desktop Layout: (unchanged)
┌──────────────────────────────────────┐
│ [🏠] آل الخنيني  [toggles]  [search][reset][theme] │
└──────────────────────────────────────┘
```

## Implementation Notes
- Use `useIsMobile()` hook (already exists) to conditionally render mobile vs desktop layouts.
- Bottom nav uses `fixed bottom-0` with `z-50`, `bg-card/80 backdrop-blur-xl`.
- All touch targets verified at 44x44px minimum.
- No changes to `familyData.ts`.

