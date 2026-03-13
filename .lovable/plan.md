

# Fix: Header Stability & Kinship Search Dropdown

## Issues Found

### 1. Header uses `sticky top-0` unnecessarily
The header is inside `div.flex.flex-col.h-[100dvh]` — the parent never scrolls (main has `overflow-hidden`). `sticky` is redundant here and can cause iOS PWA glitches with momentum scrolling. Should be a simple flex item with `shrink-0`.

### 2. Kinship PersonPicker dropdown gets clipped
The search results dropdown (`absolute top-full z-50`) is inside multiple `overflow-auto` containers (KinshipCalculator div + main wrapper). These clip the absolutely-positioned dropdown, making results invisible or partially hidden — especially the **