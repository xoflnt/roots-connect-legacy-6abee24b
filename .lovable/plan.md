

# Adjust Hero Background & Glass Effects

## Changes — single file: `src/components/LandingPage.tsx`

### FIX 1: Lighter overlay — image more visible

| Line(s) | Current | New |
|---------|---------|-----|
| 195 | `dark:bg-black/50` | `dark:bg-black/30` |
| 199 | `rgba(15,42,30,0.45) 0%, rgba(15,42,30,0.35) 40%, rgba(15,42,30,0.55) 75%` | `rgba(15,42,30,0.25) 0%, transparent 35%, rgba(246,243,238,0.85) 80%, rgba(246,243,238,1) 100%` |

### FIX 2: Lighter glass elements

**Dashboard card** (line 247):
- `bg-white/10` → `bg-white/15`, `border-white/20` → `border-white/35`, `backdrop-blur-md` → `backdrop-blur-sm`

**Dashboard stats row** (line 287):
- `bg-white/10` → `bg-white/12`, `border-white/15` → `border-white/30`

**Dashboard action buttons** (line 312):
- `bg-white/10` → `bg-white/12`, `border-white/15` → `border-white/30`, `hover:bg-white/20` → `hover:bg-white/18`

**Guest action buttons** (lines 406, 414):
- Browse tree: `bg-white/20` → `bg-white/18`, `backdrop-blur-md` → `backdrop-blur-sm`
- Login: `bg-white/10` → `bg-white/12`, `backdrop-blur-md` → `backdrop-blur-sm`

**Quick Actions grid** (line 446):
- `bg-white/10` → `bg-white/12`, `border-white/20` → `border-white/30`, `backdrop-blur-md` → `backdrop-blur-sm`

**Bottom buttons** (lines 460, 467):
- `bg-white/10` → `bg-white/12`, `backdrop-blur-md` → `backdrop-blur-sm`

**Search bars** (lines 348, 489):
- `rgba(255,255,255,0.25)` → `rgba(255,255,255,0.18)`

**Logged-in search** (line 487–495): same search bar change

### Summary
- Total: ~15 class/style tweaks across one file
- Goal: background image clearly visible in upper half, lighter glass feel, text stays readable, natural fade to page background

