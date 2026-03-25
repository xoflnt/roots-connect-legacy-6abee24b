

# Fix Hero Background Image

## Single file: `src/components/LandingPage.tsx` (lines 218-226)

Replace the current `<img>` element with updated values:

```tsx
<img
  src="/images/hero-bg.jpg"
  alt=""
  className="absolute bottom-0 left-0 right-0 w-full h-64 sm:h-80 md:h-96 object-cover object-center opacity-60 pointer-events-none select-none"
  style={{
    maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, black 70%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, black 70%)',
  }}
/>
```

**Changes:**
1. Height: `h-56 sm:h-72 md:h-80` → `h-64 sm:h-80 md:h-96`
2. Object position: `object-top` → `object-center`
3. Opacity: `opacity-50` → `opacity-60`
4. Mask gradient: simple two-stop → three-stop gradual fade

