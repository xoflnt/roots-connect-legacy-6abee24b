

# Add Mobile Hero Background + Wave Edge

## Files
- **Copy**: `user-uploads://IMG_8307.jpeg` → `public/images/hero-bg-mobile.jpg`
- **Edit**: `src/components/LandingPage.tsx` (lines 176-218)

## Changes in `src/components/LandingPage.tsx`

### Line 177 — Hero section classes
Replace `min-h-[45vh]` with `min-h-[55vh] md:min-h-[50vh]`

### Lines 182-183 — Replace image + overlay
Replace the current `<img>` and gradient `<div>` with:

1. **`<picture>` element** serving portrait image on mobile:
```tsx
<picture>
  <source media="(max-width: 768px)" srcSet="/images/hero-bg-mobile.jpg" />
  <img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none" />
</picture>
```

2. **Updated gradient overlay** with explicit sand-color bottom fade:
```tsx
<div className="absolute inset-0" style={{
  background: 'linear-gradient(to bottom, rgba(27,84,56,0.4) 0%, transparent 40%, rgba(246,243,238,0.8) 80%, rgba(246,243,238,1) 100%)'
}} />
```

3. **SVG wave** at bottom for organic edge:
```tsx
<div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
  <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg"
    className="w-full h-16 sm:h-20 fill-background" preserveAspectRatio="none">
    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
  </svg>
</div>
```

### Lines 203-217 — Title block
Add `mt-auto mb-6` to the `motion.div` className to push title toward bottom. Increase text shadow intensity to `rgba(0,0,0,0.4)`.

