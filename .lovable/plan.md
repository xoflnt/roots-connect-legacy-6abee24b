

# Three Fixes in LandingPage.tsx

## FIX 1: Stronger branch badge color

**Line 274–281** — increase opacity values and add font weight:

```tsx
style={{
  backgroundColor: `${branchHex}55`,  // was 33
  borderColor: `${branchHex}99`,       // was 66
  border: '1.5px solid',
  borderColor: `${branchHex}99`,
  color: 'white',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
  fontWeight: '600',
}}
```

## FIX 2: Colored generation badge

**Line 286** — replace `<HeritageBadge type="generation" .../>` with an inline styled span matching the branch badge aesthetic. Add a generation color map near `BRANCH_HEX`:

```ts
function getGenerationHex(depth: number): string {
  if (depth <= 3) return '#D4A82B';  // amber
  if (depth <= 6) return '#1B5438';  // green
  return '#2B5EA7';                   // blue
}
```

Render as:
```tsx
<span
  className="text-[10px] font-bold px-3 py-0.5 rounded-full border flex items-center gap-1"
  style={{
    backgroundColor: `${genHex}55`,
    borderColor: `${genHex}99`,
    border: '1.5px solid',
    borderColor: `${genHex}99`,
    color: 'white',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    textShadow: '0 1px 3px rgba(0,0,0,0.6)',
    fontWeight: '600',
  }}
>
  <Layers className="h-3 w-3" />
  الجيل {dashboardData.depth.toLocaleString('ar-SA')}
</span>
```

Import `Layers` from lucide-react (already used elsewhere).

## FIX 3: Convert images to WebP + optimize `<picture>`

**Cannot convert images in plan mode** — image conversion requires running a script. Will be done during implementation.

**Lines 193–200** — update `<picture>` element:

```tsx
<picture>
  <source media="(max-width: 768px)" srcSet="/images/hero-bg-mobile.webp" type="image/webp" />
  <source srcSet="/images/hero-bg.webp" type="image/webp" />
  <img
    src="/images/hero-bg.jpg"
    alt=""
    fetchPriority="high"
    decoding="async"
    className="absolute inset-0 w-full h-full object-cover object-top select-none"
  />
</picture>
```

JPG kept as fallback in `<img src>`.

## Files

| File | Action |
|------|--------|
| `src/components/LandingPage.tsx` | Update badge styles + picture element |
| `public/images/hero-bg.webp` | Create (convert from jpg) |
| `public/images/hero-bg-mobile.webp` | Create (convert from jpg) |

