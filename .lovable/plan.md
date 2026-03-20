

# Fix Design Consistency — 3 Tasks

## Task 1: Remove Welcome Popup
**File: `src/components/OnboardingModal.tsx`**

Delete lines 223-273 (the `if (isLoggedIn && currentUser)` block that returns the welcome-back Dialog). Logged-in users will see nothing from this component.

## Task 2: Fix Onboarding Design Consistency
**File: `src/components/OnboardingModal.tsx`**

All hardcoded values to replace:

| Current | Replacement |
|---|---|
| `style={{ backgroundColor: "#F6F3EE", backgroundImage: "radial-gradient(..." }}` (line 282-285) | `className="bg-background canvas-dots"` (reuse existing utility) |
| `bg-white` (lines 314, 379, 400, 468, 487, 529, 548, 557, 591, 623, 688, 726, 743) | `bg-card` |
| `style={{ color: "#1B5438" }}` on icons (lines 315, 353, 469, 530, 592) | `className="text-primary"` |
| `style={{ color: "#1B5438" }}` on headings (lines 324, 361, 452, 472, 540, 597) | `className="text-primary"` |
| `style={{ color: "#D4A82B" }}` on sparkles/text (lines 318-321, 327, 386) | `className="text-accent"` |
| `style={{ backgroundColor: "#1B5438", boxShadow: "..." }}` on buttons (lines 338-341, 452, 507, 575, 758) | `className="bg-primary text-primary-foreground shadow-lg rounded-xl min-h-[52px]"` |
| `style={{ backgroundColor: "#D4A82B" }}` badge (line 534) | `className="bg-accent"` |
| `fontFamily: "YearOfHandicrafts..."` (line 324) | Remove (global font) |
| `rounded-3xl` (lines 314, 468, 529, 591) | `rounded-2xl` |
| `rounded-full` on CTA buttons (lines 337, 451, 506, 574, 757) | `rounded-xl` |
| `text-3xl font-extrabold` (line 361) | `text-2xl font-bold` |
| `text-2xl font-extrabold` on other headings | `text-2xl font-bold` |
| Dot indicators `backgroundColor` inline (lines 782-783) | `className` with `bg-accent` / `bg-accent/15` |

## Task 3: Fix PWA Install Section
**File: `src/components/LandingPage.tsx`**

Lines 595-669 changes:

1. Replace emoji step numbers with styled badges:
```tsx
<span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
  {toArabicNum(n)}
</span>
```

2. Replace emoji labels:
   - `🤖` after "أندرويد" → `<Smartphone className="h-3.5 w-3.5 inline" />`
   - `🍎` after "آيفون" → `<Monitor className="h-3.5 w-3.5 inline" />` (or Apple icon via text)
   - `⬇️` in button → `<Download />` icon
   - `✅` installed text → `<Check />` icon
   - `⬆️` in iOS step → `<Share2 />` icon
   - `📲` → remove
   - `⚠️` → `<AlertTriangle />` icon
   - `✓` in dismiss button → `<Check />` icon

3. Replace amber warning:
   - `text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400` → `text-accent bg-accent/10`

4. Import `toArabicNum` from `@/utils/arabicUtils` and new Lucide icons (`Download`, `Check`, `Share2`, `AlertTriangle`, `Monitor`).

## Files Modified
- `src/components/OnboardingModal.tsx` — remove welcome popup + fix all hardcoded styles
- `src/components/LandingPage.tsx` — fix PWA section emojis and colors

