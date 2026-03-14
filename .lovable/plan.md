

# Redesign Guide Page + Add Missing Event Listeners

## Changes

### File 1: `src/pages/Guide.tsx` — Complete rewrite
Replace all 201 lines with new design containing:

- **Same header** (sticky, BookOpen icon, home button, safe-area padding)
- **Same hero** (pill + title + subtitle)
- **3 grouped sections** with colored section headers:
  - Group 1 "ابدأ من هنا" (Rocket, primary colors) — 3 cards: Registration (UserCheck/emerald), Search (Search/blue), Profile (UserCog/purple)
  - Group 2 "استكشف الشجرة" (Map, accent colors) — 4 cards: Map mode (Map/amber + "الافتراضي" badge), Navigate (Compass/green + "الأسهل للموبايل" badge), Branches (GitBranch/emerald), List (AlignJustify/slate)
  - Group 3 "ميزات متقدمة" (Zap, purple colors) — 5 cards: Lineage (ScrollText/amber), Kinship (Scale/blue), Documents (BookOpen/orange), PWA Install (Smartphone/indigo + "موصى به" badge + Android/iPhone sub-sections), Submit Request (Send/rose)
- **Footer CTA** — primary bg card with TreePine + "جاهز؟ ابدأ الاستكشاف"
- **Action buttons** on each card with deep links via `navigate()` + `CustomEvent` dispatches
- **Framer Motion**: page fadeIn, section headers staggered by group index, cards use `staggerContainer`/`staggerItem`, buttons with `whileHover`/`whileTap`
- **Imports**: `useAuth` for `currentUser` (lineage card uses `currentUser?.memberId || '100'`), `motion` from framer-motion, animation variants from `@/lib/animations`, all needed Lucide icons

Card design per spec: rounded-2xl, bg-card/80 backdrop-blur-sm, icon in colored rounded-xl, optional badge pill, ChevronLeft bullets, action button styled per group color.

### File 2: `src/pages/Index.tsx` — Add 2 missing event listeners
In the existing `useEffect` (lines 101-116), add:
- `'switch-to-map'` → `setActiveTab('map'); persistTab('map'); setShowLanding(false);`
- `'switch-to-kinship'` handler already exists but needs `setShowLanding(false)` added
- Actually `switch-to-kinship` is already there (line 102). Need to add `setShowLanding(false)` to it and to others, plus add `switch-to-map`.

Wait — looking at line 102, `onKinship` only does `setActiveTab`/`persistTab`. But the guide navigates to `/` first, so by the time the event fires the user is already on Index. However `showLanding` might be true. Need to add `setShowLanding(false)` to all switch handlers.

Updated handlers in the useEffect:
```tsx
const onMap = () => { setActiveTab('map'); persistTab('map'); setShowLanding(false); };
const onKinship = () => { setActiveTab('kinship'); persistTab('kinship'); setShowLanding(false); };
const onList = () => { setActiveTab('list'); persistTab('list'); setShowLanding(false); };
const onNavigate = () => { setActiveTab('navigate'); persistTab('navigate'); setShowLanding(false); };
const onBranches = () => { setActiveTab('branches'); persistTab('branches'); setShowLanding(false); };
```
Add `switch-to-map` listener + cleanup. Add `setShowLanding(false)` to all existing handlers.

## Files Modified
1. `src/pages/Guide.tsx` — Complete rewrite (12 feature cards in 3 groups, Framer Motion, deep links)
2. `src/pages/Index.tsx` — Add `switch-to-map` listener, add `setShowLanding(false)` to all switch handlers

