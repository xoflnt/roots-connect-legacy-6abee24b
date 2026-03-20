

# Premium Cinematic Promo Video — Implementation Plan

## Creative Direction

**Movement**: "Heritage Cartography" — warm, slow, confident. Apple keynote reverence meets Arabian genealogical tradition.

**Palette**:
- Background: `#F6F3EE` (warm sand)
- Primary: `#1B5438` (deep palm green)
- Gold: `#D4A82B` (accent)
- Warm white: `#FEFCF8`
- Dark overlay: `rgba(27, 84, 56, 0.85)`

**Motion System**:
- Enter: Slide from right (RTL) + opacity fade via spring (damping: 20)
- Exit: Fade out + slight left drift
- Scene transitions: `fade()` and `slide({ direction: "from-left" })` alternating
- Accent: Scale spring with gold shimmer on reveals
- Dot pattern: 0.06 opacity max, subtle radial grid

**Typography**: YearOfHandicrafts (Bold for headlines, Regular for body) loaded via `@remotion/fonts` from copied OTF files. Tajawal from Google Fonts for body/labels.

## Architecture

**9:16 vertical** (1080×1920), 30fps, ~50 seconds (1500 frames).

### Scenes (10 total)

| # | Scene | Frames | Key Elements |
|---|---|---|---|
| 1 | Opening | 120 | Black → gold particles → app name + subtitle |
| 2 | Landing | 120 | Phone mockup with hero section |
| 3 | Tree | 180 | Network nodes with real names (زيد، ناصر، محمد، عبدالعزيز، علي), pan + zoom |
| 4 | Person Card | 120 | Card slides up with member details |
| 5 | Branches | 120 | Three colored branch columns, overlay text |
| 6 | Search | 120 | Search bar types Arabic, results appear |
| 7 | Lineage | 150 | "عـبـدالله بن عـلـي بن مـحـمـد بن زيـد" cascading chain |
| 8 | Kinship | 120 | Two members → connection result |
| 9 | Admin | 120 | Desktop frame with stats |
| 10 | Closing | 150 | Pull back, app name returns, "جذورها في نجد — إرث ممتد عبر الأجيال" |

Transitions: 9 × ~20 frames = 180 overlap. Total composition: ~1320 frames = 44 seconds.

### File Structure
```
/tmp/promo-video/
  tsconfig.json
  scripts/render.mjs
  src/
    index.ts
    Root.tsx
    MainVideo.tsx
    fonts.ts
    colors.ts
    components/
      PhoneMockup.tsx
      DesktopMockup.tsx
      TextOverlay.tsx
      GoldParticles.tsx
      DotPattern.tsx
      TreeNetwork.tsx
    scenes/
      Opening.tsx
      LandingScene.tsx
      TreeScene.tsx
      PersonScene.tsx
      BranchesScene.tsx
      SearchScene.tsx
      LineageScene.tsx
      KinshipScene.tsx
      AdminScene.tsx
      ClosingScene.tsx
  public/fonts/ (copied OTFs)
```

### Execution Steps
1. Scaffold project, install deps, fix compositor binary
2. Copy YearOfHandicrafts fonts to project
3. Write all source files
4. Render via programmatic script → `/mnt/documents/promo-video.mp4`
5. QA with still frames, fix issues
6. Output audio timing guide → `/mnt/documents/audio-timing-guide.md`

### Key Details
- **Muted render** (sandbox ffmpeg lacks audio encoder)
- Real family names: ناصر، زيد، محمد، عبدالعزيز، علي، عبدالله
- Lineage chain with tatweel: "عـبـدالله بن عـلـي بن مـحـمـد بن زيـد"
- Closing line: "جذورها في نجد — إرث ممتد عبر الأجيال"
- Gold particles: sparse, 8-12 particles max, slow drift
- Dot pattern: opacity 0.06, radial grid

