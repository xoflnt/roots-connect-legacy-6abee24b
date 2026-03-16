

# Redesign LineageShareCard.tsx

Complete visual redesign of the Canvas 2D lineage share card. Same function signatures, same file.

## Changes to `src/components/LineageShareCard.tsx`

### Colors
Update `COLORS` constant to match spec exactly (rename keys: `bg1`, `bg2`, `textLight` opacity to 0.28).

### Canvas size
Change from 1080×1350 to 1080×1440, SCALE stays 2.

### Layout (top to bottom)

**Header (0→160)**:
- Top 4px gold gradient line
- TreePine icon: draw simple triangle + rect trunk at y=50, gold 60% opacity
- Title "بوابة تراث الخنيني" bold 28px at y=100
- Subtitle "فرع الزلفي" 18px at y=128
- 200px centered gold separator at y=155

**Person Card (175→310)**:
- White rounded rect (560×115, radius 16, centered)
- Border: branch color at 40%
- First name (chain[0]) bold 42px centered inside card
- Branch pill at bottom of card (bold 14px, branch color bg+18%)
- Generation badge "الجيل X" top-left corner, 12px muted

**Ancestor Chain (310→dynamic)**:
- Start from chain[1] (no duplicate of chain[0])
- lineHeight = clamp(70, availableH/chain.length, 110)
- Each ancestor: gold dot → "ابن/بنت" connector → name with decreasing size (32→28→24→20) and opacity (0.85→0.50)
- Generation label "جX" to the right of each name

**Vertical dashed line**: from below person card to above family name

**Family Name**: "◆ الخنيني ◆" bold 46px gold, centered

**Heritage Text Block** (bottom-right):
- 3px gold vertical bar as quote indicator
- Three lines of heritage text, right-aligned
- Muted/light colors

**Footer (last ~120px)**:
- Gold separator
- Generation count "سلسلة نسب من X أجيال" 16px
- Branding "بوابة تراث الخنيني — حفظ الإرث للأجيال" bold 15px goldMid
- Bottom 4px gold line

### Privacy
Keep existing `isLoggedIn` parameter and privacy imports. No privacy-sensitive fields are currently drawn on lineage card (no age/spouse/mother), so no changes needed there.

### No other files modified
`LineageView.tsx` already imports `generateLineageImage` from `./LineageShareCard` — no import changes needed.

**Single file**: `src/components/LineageShareCard.tsx`

