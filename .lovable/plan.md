

# Count-Up Animation + Fun Statistics

## Changes to `src/components/LandingPage.tsx`

### 1. Count-Up Animation Hook
Create a `useCountUp(target, duration)` hook using `useState` + `useEffect` + `requestAnimationFrame` that animates from 0 to target over ~1.5s with easing. Trigger via Intersection Observer so it fires when the stats section scrolls into view.

### 2. Remove "عدد الفروع" & Add Fun Stats
Replace the current 3-stat grid with more interesting stats computed from `familyMembers`:

- **عدد الأفراد** (total members) — keep, with Users icon
- **عدد الأجيال** (generations) — keep, with Layers icon
- **أكثر اسم تكراراً** — find the most repeated first name (extract first word of `name`), show name + count (e.g., "محمد × 12") with Crown icon
- **عدد الذكور** — count gender "M", with icon
- **عدد الإناث** — count gender "F", with icon

Use a 2-col grid on mobile, 3-col on desktop (or similar responsive layout). The name stat spans full width or gets special styling.

### 3. Implementation Details
- `computeStats()` updated to return: `total`, `generations`, `males`, `females`, `topName`, `topNameCount`
- Count-up applies to numeric values only
- The "most repeated name" card shows the name as text + count with count-up
- IntersectionObserver with `threshold: 0.3` on the stats container triggers animation once

