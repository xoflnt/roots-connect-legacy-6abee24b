

# Replace Hero Background Images

## Changes

Two file copies — no code changes needed.

1. Copy `user-uploads://IMG_8328.jpeg` (landscape) to `public/images/hero-bg.jpg`
2. Copy `user-uploads://IMG_8329.jpeg` (portrait) to `public/images/hero-bg-mobile.jpg`

The existing `<picture>` element in `LandingPage.tsx` already references these paths, so the new images will appear immediately.

