

# Landing Page Enhancements

## 4 Changes in `src/components/LandingPage.tsx`

### 1. Theme Toggle in Hero
- Import `ThemeToggle` from `@/components/ThemeToggle`
- Add it as absolute-positioned element at `top-4 left-4` (appears top-left in RTL) inside the hero section

### 2. Remove "أكثر أب إنجاباً" Stat
- Delete lines 252-254 (the `col-span` wrapper with Baby/topFather stat)
- Remove `Baby` from lucide imports
- Remove `topFatherName`, `topFatherChildCount` from `computeStats` (lines 81-97)

### 3. Add Dedication/Quote Section
Insert a new section between the About section and footer with the father's quote:

```text
┌─────────────────────────────────┐
│  ✦ كلمة الموثّق                │
│                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│  │ "الهدف من هذه الشجرة..."  │ │
│  │ right-border accent        │ │
│  │ Quote icon top-right       │ │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│  — جمع وتوثيق علي المحمد       │
│    ٢/١٢/١٤٤١                   │
└─────────────────────────────────┘
```

- Import `Quote` from lucide
- Styled blockquote with `border-r-4 border-accent` (RTL right = visual right), glass card background, italic text

### 4. Fix Scroll-Down Arrow Overlap
- Add `pb-24` to the hero's inner content wrapper (line 145) to push content up and create clearance
- Change arrow from `bottom-10` to `bottom-6` with `z-10`

### File
Only `src/components/LandingPage.tsx` needs changes.

