

# Two Improvements: Tatweel Utility + Lineage Share Card Redesign

## Improvement 1: Tatweel Utility

### New file: `src/utils/tatweelUtils.ts`
Create the utility with the regex-based tatweel function that exempts sacred words ("الله", "الرحمن", "الرحيم") and words ≤ 2 chars.

### Files to modify for UI tatweel (display headings only)

| File | Line | Current text | Change |
|------|------|-------------|--------|
| `src/components/LandingPage.tsx` | ~204 | Already has tatweel from prior change | Verify it uses `"بـوابـة تـراث الخـنـيـنـي"` — no change needed |
| `src/components/tree/BranchesView.tsx` | 235 | `{pillar?.label}` | Import `applyTatweel`, wrap: `{applyTatweel(pillar?.label ?? "")}` — this is an `text-lg font-extrabold` heading |
| `src/components/LineageView.tsx` | 128-129 | `نسب {chain[0].name}` | Change to `نـسـب {chain[0].name}` (hardcoded tatweel on "نسب" only, name unchanged) |
| `src/pages/Guide.tsx` | 326 | `دليل الاستخدام` | Change to `دلـيـل الاسـتـخـدام` |
| `src/pages/Documents.tsx` | 177 | `مستندات تاريخية` | Change to `أرشـيـف العائـلـة الموثّـق` per spec |

Note: AppHeader title "الخنيني" at line 60 is `text-base md:text-lg` — borderline size. The user spec says to apply tatweel to AppHeader main title. Will apply `applyTatweel("الخنيني")` there.

### NOT applying tatweel to:
- Navigation labels, badges, buttons, body text, person names in lists
- Any text under 20px font size (except the AppHeader title per explicit request)

---

## Improvement 2: Lineage Share Card Complete Redesign

### `src/components/LineageShareCard.tsx` — full rewrite

**Canvas dimensions**: Dynamic height. `W = 1080`, `H = max(1620, 220 + 180 + (chain.length - 1) * 148 + 76 + 200 + 160)` capped at 1920.

**New color palette** (dark green header):
```
greenDeep: '#0F2A1E', greenPrimary: '#1B5438', gold: '#C9A84C',
goldMid: 'rgba(201,168,76,0.45)', cream: '#F7F3EE', etc.
```

**Layout sections**:

1. **Header (0→220)**: Dark green (`greenDeep`) background, dot pattern overlay (gold 6% opacity), tree icon at y=55, title "بـوابـة تـراث الخـنـيـنـي" bold 52px white at y=115, subtitle "فـرع الزلـفـي" 28px goldMid at y=152, gold separator at y=178, bottom fade gradient from greenDeep → cream at y=180.

2. **Person Card (220→400)**: 760×155px centered card, white 85% opacity bg, branch-color border (2px, 60% opacity), 24px radius. Name (first name, tatweel if ≤5 chars) bold 72px centered. Branch pill bold 22px. Generation badge "الجيل X" top-right 18px.

3. **Chain (420→dynamic)**: 148px spacing per ancestor. Vertical dashed line (goldMid, lineWidth 2, dash [5,12]). Gold dots (8px radius). Names with tatweel if ≤5 chars. Sizes: i=1→60px, i=2→52px, i=3→44px, i=4→36px, i=5+→30px. Opacities: 1.0→0.82→0.68→0.56→0.45. **No "ابن/بنت" text** — dots only.

4. **Family Name**: "◆ الخـنـيـنـي ◆" bold 76px gold, centered. Gold separator 260px below.

5. **Heritage Block** (full-width centered): Light gold bg (7% opacity), top+bottom 1px borders, 48px vertical padding. Two vertical gold accent bars (left x=72, right x=W-77). Three centered lines with tatweel: bold 26px / 24px / italic 22px, 44px line spacing.

6. **Footer (last 160px)**: greenDeep fade from transparent. Generation count 26px. Branding with tatweel bold 24px goldMid. Bottom 5px gold bar.

**Canvas tatweel helper** (`applyTatweelCanvas`): Same exempt-word logic, applies to names ≤5 chars using regex insertion.

**Key differences from current**:
- Taller canvas (9:16 ratio for social sharing)
- Dark green header instead of cream
- Much larger typography (72px name vs 42px)
- No "ابن/بنت" connector text — dots only
- Heritage block is full-width centered instead of bottom-right
- Dynamic height based on chain length
- Bigger person card (760px vs 560px)

### Files summary

| Action | File |
|--------|------|
| CREATE | `src/utils/tatweelUtils.ts` |
| EDIT | `src/components/AppHeader.tsx` — line 60 |
| EDIT | `src/components/tree/BranchesView.tsx` — line 235 |
| EDIT | `src/components/LineageView.tsx` — line 129 |
| EDIT | `src/pages/Guide.tsx` — line 326 |
| EDIT | `src/pages/Documents.tsx` — line 177 |
| REWRITE | `src/components/LineageShareCard.tsx` |

