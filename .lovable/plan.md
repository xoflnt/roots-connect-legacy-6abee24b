

# Three Improvements

## 1. Smooth View Transitions (CSS-only, no framer-motion needed)
We already have `fade-in` and `scale-in` animations in tailwind config. Instead of adding a heavy dependency, we'll wrap each view in `Index.tsx` with an `animate-fade-in` class using a key prop to trigger re-animation on view change.

**File: `src/pages/Index.tsx`**
- Wrap each view's container div with `animate-fade-in` class
- Use `key={activeView}` on the main content wrapper to force re-mount and trigger animation on view switch

## 2. Family Statistics Section on Landing Page
Compute stats from `familyMembers` data and display them between the CTA and the About section.

**File: `src/components/LandingPage.tsx`**
- Calculate: total members, number of generations (max depth from root), number of branches (root's direct children)
- Add a 3-column stats grid between CTA and scroll indicator
- Cards with large numbers and Arabic labels: "عدد الأفراد", "عدد الأجيال", "عدد الفروع"

## 3. Fix CTA Button Covering Search Results
The CTA button sits directly below the search bar in the layout flow, so search dropdown results (z-50) get covered by it.

**File: `src/components/LandingPage.tsx`**
- Hide the CTA button when search results are showing (`open && filtered.length > 0`)
- Or give the search dropdown container a higher z-index and ensure the CTA has lower stacking

Simplest fix: conditionally hide CTA div when search dropdown is open.

