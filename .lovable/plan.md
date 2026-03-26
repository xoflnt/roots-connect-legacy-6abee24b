

# Fix Text Readability in Hero Section

## Changes — single file: `src/components/LandingPage.tsx`

### FIX 1: Title and subtitle (lines 233-237)
- Title `textShadow`: `'0 2px 8px rgba(0,0,0,0.5)'` → `'0 2px 16px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)'`
- Subtitle: `text-white/80` → `text-white/90`, same stronger textShadow

### FIX 2: TreePine icon (line 232)
- `filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'` → `'drop-shadow(0 2px 8px rgba(0,0,0,0.8))'`

### FIX 3: Glass card text
- **Stats labels** (line 289): `text-white/70` → `text-white/85`, add `style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}`
- **Action button labels** (line 312): `text-white/90` → `text-white`
- **Quick Actions icon** (line 448): `text-white/90` → `text-white`
- **Quick Actions label** (line 449): `text-white/85` → `text-white`, add textShadow

### FIX 4: Guest heading (line 332)
- `textShadow`: `'0 2px 8px rgba(0,0,0,0.5)'` → `'0 2px 16px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)'`

### FIX 5: Bottom buttons (lines 460, 467)
- `text-white/80` → `text-white`, add `style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}`

### Summary
~10 targeted text style tweaks. No glass/blur/background changes.

