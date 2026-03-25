

# Add Hero Background Image

## Changes

### 1. Copy image to `public/images/hero-bg.jpg`
Copy the uploaded watercolor desert image to the public directory.

### 2. Modify `src/components/LandingPage.tsx` (line 176)

Current hero section opening tag:
```tsx
<section className="relative flex flex-col items-center justify-center px-4 text-center pb-4" style={{ paddingTop: "max(3rem, calc(env(safe-area-inset-top) + 1rem))" }}>
```

Change to add background image in the inline style and keep `relative` positioning (already present). Then add an overlay div right after the opening tag:

```tsx
<section
  className="relative flex flex-col items-center justify-center px-4 text-center pb-4"
  style={{
    paddingTop: "max(3rem, calc(env(safe-area-inset-top) + 1rem))",
    backgroundImage: 'url(/images/hero-bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  <div className="absolute inset-0 bg-background/75" />
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
```

Remove the old gradient line (line 177) since it's now included after the overlay. All existing children already sit above the overlay due to the section's stacking context.

**Files**: Copy `user-uploads://IMG_8303.jpeg` → `public/images/hero-bg.jpg`, edit `src/components/LandingPage.tsx` (lines 176-177).

