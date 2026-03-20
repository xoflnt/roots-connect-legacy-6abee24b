

# Recreate Promo Video with Real App Screenshots

## Step 1: Capture Screenshots

Use a Puppeteer script (run via `lov-exec`) to capture 8 screenshots from the live published app at `https://roots-connect-legacy.lovable.app`. Save to `/tmp/promo-video/public/screenshots/`.

**Mobile (390×844):**
1. `landing.png` — `/` (landing page hero)
2. `tree.png` — `/?view=map` (family tree, wait for render)
3. `person.png` — `/person/1` (any member detail)
4. `branches.png` — `/?view=branches` (branches view)
5. `search.png` — `/?view=navigate` (navigate view with search)
6. `lineage.png` — `/?view=navigate` or `/person/1` (lineage section)
7. `kinship.png` — `/?view=kinship&p1=1&p2=209` (kinship with pre-selected members)

**Desktop (1440×900):**
8. `admin.png` — `/admin` (will likely show login gate — capture whatever is visible; if blocked, create a styled admin mockup screenshot)

The script uses Puppeteer with the sandbox Chromium (`/nix/var/nix/profiles/sandbox/bin/chromium`).

## Step 2: Replace Scene Components

Keep these files **unchanged**: `Opening.tsx`, `ClosingScene.tsx`, `MainVideo.tsx`, `Root.tsx`, `colors.ts`, `fonts.ts`, `FontLoader.tsx`, `GoldParticles.tsx`, `DotPattern.tsx`, `TextOverlay.tsx`, `PhoneMockup.tsx`, `DesktopMockup.tsx`, `render.mjs`.

### New reusable component: `KenBurnsImage.tsx`
Displays a screenshot with slow Ken Burns zoom/pan animation:
- Uses `staticFile()` to load the screenshot
- `interpolate(frame, [0, duration], [startScale, endScale])` for zoom (e.g., 1.0 → 1.15)
- `interpolate(frame, [0, duration], [startX, endX])` for pan (e.g., 0 → -20px)
- Props: `src`, `startScale`, `endScale`, `panX`, `panY`

### Rewrite 8 scene files (Scenes 2-9)

Each scene follows this pattern:
```
AbsoluteFill (bg color)
  → PhoneMockup/DesktopMockup with spring entrance
    → KenBurnsImage (screenshot, Ken Burns params vary per scene)
  → TextOverlay (same text as original)
```

**Scene-specific Ken Burns:**
- Landing: slow zoom in (1.0→1.1), no pan
- Tree: zoom out to in (1.2→1.0), slight upward pan — reveals scope
- Person: zoom in (1.0→1.15), pan down — follows detail card
- Branches: slow zoom (1.0→1.08), subtle right pan
- Search: zoom in (1.0→1.12), pan up — follows search results
- Lineage: slow zoom (1.0→1.1), downward pan — follows chain
- Kinship: zoom in (1.0→1.15), no pan — centered result
- Admin (desktop): slow zoom (1.0→1.06), slight pan — dashboard overview

## Step 3: Render

Same render script, output to `/mnt/documents/promo-video-real.mp4`.

## Files

**Create:**
- `/tmp/promo-video/scripts/screenshots.mjs` — Puppeteer screenshot capture
- `/tmp/promo-video/src/components/KenBurnsImage.tsx`

**Rewrite:**
- `/tmp/promo-video/src/scenes/LandingScene.tsx`
- `/tmp/promo-video/src/scenes/TreeScene.tsx`
- `/tmp/promo-video/src/scenes/PersonScene.tsx`
- `/tmp/promo-video/src/scenes/BranchesScene.tsx`
- `/tmp/promo-video/src/scenes/SearchScene.tsx`
- `/tmp/promo-video/src/scenes/LineageScene.tsx`
- `/tmp/promo-video/src/scenes/KinshipScene.tsx`
- `/tmp/promo-video/src/scenes/AdminScene.tsx`

**Update:**
- `/tmp/promo-video/scripts/render.mjs` — output path → `promo-video-real.mp4`

**Unchanged:**
- Opening, Closing, MainVideo, Root, all shared components

