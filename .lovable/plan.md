

# Fix 6 Bugs in LineageShareCard.tsx

Single file: `src/components/LineageShareCard.tsx`

## Bug 1: Last ancestor overlaps family name
**Current**: `chainEndY = lastChainPosition + 40`, then `familyNameY = chainEndY + 36`. But each ancestor's name is drawn at `y + 42` with font sizes up to 60px, so the text bottom extends well past the chain position + 40.

**Fix**: Track actual last ancestor bottom Y (position + 42 + some descent margin based on font size). Set `familyNameY = lastAncestorBottomY + 60`.

## Bug 2: Empty space between heritage block and footer
**Current**: Canvas height is pre-computed with fixed constants and clamped to 1620–1920. Heritage block and footer positions are independent — heritage is placed after family name, but footer is pinned to `H - 160`, creating a gap.

**Fix**: Compute canvas height dynamically from actual content: `H = heritageBlockBottom + 40 + FOOTER_H`. Remove the min/max clamp. Footer sits right after heritage block.

## Bug 3: Ancestor spacing too large
**Current**: `CHAIN_SPACING = 148`.

**Fix**: Change to `110`.

## Bug 4: Dot position misaligned
**Current**: Dots are drawn at the chain position `y`, and names at `y + 42`. This means dots sit above the name text rather than between ancestors.

**Fix**: Two-pass approach — first compute all name positions and their bounding boxes, then draw dots at the midpoint between the bottom of one name and the top of the next. For the first ancestor, place the dot at the midpoint between `chainStartY` and the first name's top.

## Bug 5: Subject name overflows card
**Current**: Font is fixed at `bold 72px` with no measurement.

**Fix**: Add a while-loop that measures text width and shrinks font from 72 down to 40 in steps of 4 until it fits within 680px.

## Bug 6: Tatweel breaks short names
**Current**: `applyTatweelCanvas` applies tatweel to names ≤ 5 chars, which incorrectly elongates 3-char names like "زيد".

**Fix**: Replace with expanded exempt list and raise minimum to `< 5` (i.e., only apply to names with 5+ chars).

## Implementation approach

Rewrite the file with these changes:

1. **Lines 39-46** — Replace `applyTatweelCanvas` with new version: exempt list includes 'زيد', 'علي', 'نور', 'ابن', 'بنت', 'آل', 'أبو', 'بن', 'أم'; threshold changed from `<= 5` to `< 5`.

2. **Line 119** — Change `CHAIN_SPACING` from `148` to `110`.

3. **Lines 121-129** — Remove pre-computed height. We'll compute H after all positions are known. Use a temporary large canvas, then resize at the end (or compute positions in a first pass before creating the canvas). Better approach: do a two-pass — first pass computes all Y positions and final H, second pass draws.

4. **Lines 213-218** — Add font auto-shrink loop for subject name.

5. **Lines 249-298** — Rewrite chain rendering:
   - First pass: compute each ancestor's Y position, font size, and name metrics
   - Compute dot positions as midpoints between consecutive name bounding boxes
   - Track `lastAncestorBottomY`

6. **Lines 303-311** — Set `familyNameY = lastAncestorBottomY + 60`

7. **Lines 316-380** — Compute `heritageY` from `familyNameY + 52`, `heritageBottom = heritageY + heritageH`, then `H = heritageBottom + 40 + FOOTER_H`. Create canvas with this dynamic H (move canvas creation after position computation).

### Architecture for dynamic height

Since canvas must be created before drawing but H depends on layout, the approach is:
1. Pre-compute all Y positions (chain positions, family name Y, heritage Y) using arithmetic only
2. Calculate final H
3. Create canvas with that H
4. Draw everything using pre-computed positions

This is clean because all position calculations are pure math — no ctx needed until drawing.

