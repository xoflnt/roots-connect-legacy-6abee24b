

# Add Framer Motion Throughout the App

## Overview
Install `framer-motion` and systematically apply physics-based animations across 9 files, plus create a shared animation variants library. All existing CSS animations remain as fallback where Framer Motion is not applied.

## Files to Create/Modify

### 1. `package.json` — Add dependency
Add `"framer-motion": "^11.0.0"` to dependencies.

### 2. `src/lib/animations.ts` — New file
Reusable variants and spring configs:
- `fadeIn`, `slideUp`, `slideDown`, `scaleIn` (initial/animate/exit/transition)
- `springConfig` (stiffness 400, damping 30), `gentleSpring` (stiffness 200, damping 25)
- `staggerContainer` (staggerChildren: 0.06), `staggerItem` (opacity+y)
- `reducedMotion` helper: checks `prefers-reduced-motion` and returns `{ duration: 0 }` when active

### 3. `src/components/LandingPage.tsx`
- Import `motion, AnimatePresence` from framer-motion + variants from `@/lib/animations`
- **Hero**: Wrap TreePine icon + title + subtitle in `motion.div` with fadeIn + y:-20, staggered delays (replace CSS `animate-fade-in` + `animationDelay`)
- **Dashboard card** (logged-in): `motion.div` with gentleSpring scale+opacity entrance
- **Dashboard stats row**: `motion.div` with `staggerContainer`, each stat as `motion.div` with `staggerItem`
- **Dashboard action buttons**: Same stagger pattern
- **Quick actions grid**: `staggerContainer` + each button as `motion.button` with `whileHover={{ scale: 1.03 }}` and `whileTap={{ scale: 0.97 }}`
- **Pillar cards**: `staggerItem` + `whileHover={{ y: -4 }}`
- **Guest CTA**: `motion.div` with slideUp

### 4. `src/pages/Index.tsx`
- Import `motion, AnimatePresence`
- **Tab content**: Wrap non-map tab content in `<AnimatePresence mode="wait"><motion.div key={activeTab} initial/animate/exit with opacity+x>`
- **Bottom nav active indicator**: Replace static `<div>` with `<motion.div layoutId="activeTabIndicator">` for smooth sliding between tabs
- **Bottom nav icon**: `<motion.div animate={{ scale: isActive ? 1.15 : 1 }} transition={springConfig}>`

### 5. `src/components/tree/SmartNavigateView.tsx`
- Import `motion, AnimatePresence, useAnimation`
- **Center card**: Replace CSS slide classes with Framer Motion `useAnimation` controls. On `navigateTo()`: animate out (opacity 0, translate based on direction, 150ms), update state, animate in (opacity 1, translate 0, gentleSpring)
- **Swipe**: Replace manual touch handlers with `<motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd>` for rubber-band swipe feel. Keep the `sonsScrollRef` exclusion logic.
- **Father card**: `motion.div` with initial opacity:0 y:-15, animate gentleSpring
- **Son cards**: `staggerContainer` + `staggerItem` with `whileHover/whileTap`
- **Breadcrumb**: Each crumb as `motion.span` with stagger
- Remove `directionClass` map, `swipeOffset` state, and manual touch handlers

### 6. `src/components/PersonDetails.tsx`
- Import `motion`
- **Info rows** (age, mother, birth, death, phone, contact sections): Wrap in `motion.div` staggerContainer, each row as `motion.div` staggerItem
- **Children chips**: Each chip as `motion.div` with scaleIn + spring delay `i * 0.03` + `whileTap={{ scale: 0.95 }}`

### 7. `src/components/KinshipCalculator.tsx`
- Import `motion, AnimatePresence`
- **Person picker cards**: `<AnimatePresence mode="wait"><motion.div key={person?.id || 'empty'} ...scaleIn>`
- **Result card**: `motion.div` with slideUp + gentleSpring
- **Relationship title**: `motion.h2` with scaleIn + delay 0.1
- **Person chips**: Person1 initial `x: 30`, Person2 initial `x: -30`, both animate to `x: 0`

### 8. `src/components/tree/BranchesView.tsx`
- Import `motion, AnimatePresence`
- **Branch cards (mobile)**: `staggerContainer` + `staggerItem` + `whileTap={{ scale: 0.98 }}`
- **Branch expand/collapse (desktop)**: `<AnimatePresence>` with `motion.div` height 0→auto animation
- **Generation sections (mobile)**: Each section with `motion.div` initial opacity:0 x:20, staggered delays

### 9. `src/components/OnboardingModal.tsx`
- Import `motion, AnimatePresence`
- **Step transitions**: `<AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>`
- **Progress dots**: `motion.div` with `animate={{ scale: i === step ? 1.3 : 1 }}`

### 10. `src/components/FamilyTree.tsx`
- Import `motion, AnimatePresence`
- **Control buttons**: Each as `motion.button` with `whileHover={{ scale: 1.1 }}` `whileTap={{ scale: 0.9 }}`
- **Filter panel**: `<AnimatePresence>` with `motion.div` scaleIn + gentleSpring on open/close
- **Expand dropdown**: Same AnimatePresence pattern

### 11. `src/components/LineageView.tsx`
- Import `motion`
- **Ancestor chain cards**: `staggerContainer` + `staggerItem` with delay `i * 0.08`
- **Timeline dots**: `motion.div` initial `scale: 0`, animate `scale: 1` with springConfig + delay
- **Timeline connectors**: `motion.div` initial `scaleY: 0`, animate `scaleY: 1`
- **Share/download buttons**: `whileHover={{ scale: 1.02 }}` `whileTap={{ scale: 0.97 }}`

## Rules Enforced
- No animation on React Flow node positions (React Flow manages those)
- `prefers-reduced-motion` respected globally via helper
- Existing CSS animation classes kept as fallback where not replaced
- Duration limits: micro 100-150ms, normal 200-300ms, complex 250-350ms, max 400ms
- Spring configs: interactive stiffness 400/damping 30, content stiffness 200/damping 25

## Summary
- **1 new file**: `src/lib/animations.ts`
- **1 modified config**: `package.json`
- **9 modified components**: LandingPage, Index, SmartNavigateView, PersonDetails, KinshipCalculator, BranchesView, OnboardingModal, FamilyTree, LineageView

