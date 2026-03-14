

# Replace الوثائق + الدليل with تنقل + فروع

## File 1: `src/components/LandingPage.tsx`

**Line 2** — Add `Compass, GitBranch` to lucide imports.

**Lines 339-340** — Replace the two grid buttons:
```tsx
// Old:
{ label: "الوثائق", icon: BookOpen, color: "text-amber-600", onClick: () => navigate("/documents") },
{ label: "الدليل", icon: BookMarked, color: "text-muted-foreground", onClick: () => navigate("/guide") },

// New:
{ label: "تنقل", icon: Compass, color: "text-primary", onClick: () => { onBrowseTree(); window.dispatchEvent(new CustomEvent('switch-to-navigate')); } },
{ label: "فروع", icon: GitBranch, color: "text-primary", onClick: () => { onBrowseTree(); window.dispatchEvent(new CustomEvent('switch-to-branches')); } },
```

## File 2: `src/pages/Index.tsx`

**Lines 100-107** — Add two new event listeners alongside existing ones:
```tsx
const onNavigate = () => { setActiveTab('navigate'); persistTab('navigate'); };
const onBranches = () => { setActiveTab('branches'); persistTab('branches'); };
window.addEventListener('switch-to-navigate', onNavigate);
window.addEventListener('switch-to-branches', onBranches);
// cleanup:
window.removeEventListener('switch-to-navigate', onNavigate);
window.removeEventListener('switch-to-branches', onBranches);
```

## Summary
- **LandingPage.tsx**: Replaced الوثائق (documents) and الدليل (guide) grid buttons with تنقل (Compass, dispatches `switch-to-navigate`) and فروع (GitBranch, dispatches `switch-to-branches`)
- **Index.tsx**: Added listeners for `switch-to-navigate` and `switch-to-branches` events to switch active tab

