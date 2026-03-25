

# Redesign Hero as Cinematic Landscape Header

## Single file: `src/components/LandingPage.tsx`

### Change 1: Hero section wrapper (line 176-181)
- Remove `bg-background` from className
- Add `min-h-[45vh]` for taller hero
- Keep `overflow-hidden`, `relative`, flex centering, padding

### Change 2: Replace image + add overlays (lines 218-226)
Remove current bottom-positioned `<img>` with mask. Replace with:

1. **Full-bleed background image** right after the section opens (before controls):
```tsx
<img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none" />
```

2. **Gradient overlay** for text readability + bottom fade:
```tsx
<div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(27,84,56,0.55) 0%, transparent 50%, var(--background) 100%)' }} />
```

### Change 3: Restyle title text (lines 208-215)
- `TreePine`: `text-primary` → `text-white` + textShadow
- `h1`: `text-primary` → `text-white` + textShadow
- `p` ("فرع الزلفي"): `text-muted-foreground` → `text-white/80` + textShadow
- All get `style={{ textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}`

### Change 4: Remove top accent line (line 182)
The green gradient line is no longer needed with the cinematic header.

### What stays unchanged
Everything below line 227 (search bar, dashboard, buttons grid) remains exactly as-is on `bg-background`.

