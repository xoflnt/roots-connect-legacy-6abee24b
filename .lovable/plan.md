

# Lineage View & Landing Page Fixes

## 4 Issues to Fix

### 1. Lineage Card Overflow on Mobile
At 390px: `px-4` padding (32px) + `gap-4` (16px) + `w-8` rail (32px) = 80px overhead, leaving ~310px for the card. The card's internal layout (name + generation badge side by side at `px-4`) can push content off-screen with long names/spouse text.

**Fix in `LineageView.tsx`:**
- Reduce card internal padding from `px-4` to `px-3` on mobile
- Make generation badge wrap below the name on small screens instead of `justify-between` in same row
- Add `overflow-hidden` to card container
- Change spouse text from `truncate` to `break-words line-clamp-2` so long spouse names wrap

### 2. Gender Colors Enhancement
Current male color `200 60% 24%` is very dark blue, female `152 30% 32%` is dark green — too similar and muted.

**Fix in `index.css`:**
- Male: brighter blue `210 70% 45%` (light mode), `210 60% 60%` (dark mode)  
- Female: rose/pink `340 55% 50%` (light mode), `340 45% 60%` (dark mode)
- Update light variants accordingly

### 3. Spouse Display in Lineage
- Replace generic `Heart` with a filled heart icon with rose/pink color
- Add "الزوجة:" label prefix for clarity

### 4. Quote Text — Use Exact User Text
Replace the current altered quote (lines 293-296) with the user's exact original text:

> "الهدف من هذه الشجرة التوثيق مثل تواريخ الميلاد،الوفاة،المصاهرة وترتيب الاخوة
> نسأل الله سبحانه وتعالى لأبائنا وامهاتنا وابائهم وامهاتهم ومن له حق علينا بالرحمة والمغفرة وان يجمعنا جميعاً معهم بجنات النعيم"
> 
> — جمع وتوثيق علي المحمد ٢/١٢/١٤٤١

(Fix only the typo "حميعا" → "جميعاً")

## Files to Modify
1. `src/components/LineageView.tsx` — card layout, overflow, spouse styling
2. `src/index.css` — gender color variables
3. `src/components/LandingPage.tsx` — quote text (lines 293-301)

