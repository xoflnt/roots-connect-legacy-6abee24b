

# Page Transitions & Admin Shortcut

## 1. Smooth Page Transitions

Currently, views switch instantly via conditional rendering with `key={activeView}` on `<main>`. Each view already has `animate-fade-in` but there's no exit animation or slide effect.

**Approach**: Add a lightweight transition wrapper that applies a fade+slide animation on mount. No heavy library needed — use CSS `@keyframes` already defined in the project plus a small wrapper component.

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Wrap each view content in a transition div with unique key per view, using `animate-fade-in` with a subtle slide-up effect |
| `src/components/LandingPage.tsx` | Add `animate-fade-in` to the landing page root container |
| `tail