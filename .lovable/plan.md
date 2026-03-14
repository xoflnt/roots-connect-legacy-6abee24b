

# Fix: Reversed Text & Misplaced Periods in KinshipDocumentView

## Problem Analysis

Both issues stem from **BiDi (Bidirectional text) rendering**:

1. **Reversed first line**: The `<button>` elements inside the `<p>` tag break the browser's RTL text reordering algorithm. The LCA name "ناصر" (rendered as a `<button>`) gets visually repositioned to the right (start) of the line instead of staying at the end where it belongs in the sentence.

2. **Periods on the wrong side**: The period `.` is a "neutral" character in Unicode BiDi. When it follows a `<button>` element boundary, the browser doesn't know which direction to attach it to, so it floats to the wrong side.

## Fix

**File**: `src/components/kinship/KinshipDocumentView.tsx`

Add a Right-to-Left Mark (`\u200F`) before each period to anchor it correctly, and wrap each `<button>` in a `<span style={{ unicodeBidi: 'isolate' }}>` — or simpler: change the `<button>` elements to `<span role="button" tabIndex={0}>` with inline styling, and add `style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}` on each `<p>` tag.

**Simplest approach**: Add `dir="rtl"` and `className="text-right"` on each `<p>`, plus insert `\u200F` (RLM character) before every period/comma to force correct placement. This is a 3-line change pattern repeated on each paragraph.

Specifically:
- Line 28: `<p className="text-sm leading-relaxed text-foreground" dir="rtl">`
- Line 34: change `.` to `{"\u200F."}` 
- Line 36: same `dir="rtl"` + RLM before period on line 38
- Lines 43-46: RLM before periods in template literals (`\u200F.`)

Same pattern applies to any other component with inline tappable elements inside Arabic paragraphs (check KinshipCardView directional lines too).

