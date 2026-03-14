

# Fix PersonDetails Sheet/Drawer — Content-Hugging Scroll

## Problem
The desktop Sheet uses `h-[92dvh]` (fixed full height) with an inner `flex-1 overflow-y-auto` div, creating an ugly internal scroll box that always fills 92% of the viewport even for short profiles.

## Fix — Single File Change

**File**: `src/components/PersonDetails.tsx`

### Mobile Drawer (already close to correct)
- `DrawerContent`: keep `max-h-[92dvh] overflow-y-auto` — vaul drawer already uses `h-auto` by default so it hugs content naturally. Just ensure safe-area padding is correct.

### Desktop Sheet
Remove the `flex flex-col` layout with inner scroll div. Instead:
- `SheetContent`: remove `h-[92dvh]`, keep only `max-h-[92dvh]`, add `overflow-y-auto`, remove `flex flex-col`, remove `p-0`
- Remove the inner `<div className="flex-1 overflow-y-auto ...">` wrapper entirely — render `<DetailContent>` directly inside `SheetContent`
- Move padding (`px-6`) and bottom safe-area padding into the `DetailContent` wrapper or `SheetContent` itself
- Keep the sticky header with close button: `SheetHeader` stays `sticky top-0 bg-background/95 backdrop-blur-sm z-10`

Result: short profiles → sheet is small; long profiles → sheet grows up to 92dvh then scrolls as one unit.

