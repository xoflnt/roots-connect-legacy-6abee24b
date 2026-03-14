

# Fix 4 Issues in KinshipCalculator

## Files to Modify

| File | Changes |
|------|---------|
| `src/services/familyService.ts` | Gender-aware `kinshipToArabic`, `kinshipDirectional`, `asymTitle`, `lcaContextWord` |
| `src/components/kinship/KinshipCardView.tsx` | Gender-aware LCA label, directional "هو"/"هي", mother name in PersonChip, share flow fix |
| `src/components/kinship/KinshipTreeView.tsx` | Gender-aware LCA label, mother name on endpoint nodes |
| `src/components/kinship/KinshipDocumentView.tsx` | Gender-aware LCA pronoun ("عنه"/"عنها"), "جدهما"/"جدتهما", gender-aware mother labels |
| `src/components/PersonDetails.tsx` | Scrollable sheet/drawer fix |

---

## FIX 1: Gender Awareness

### `familyService.ts` — `kinshipToArabic()`
Currently all terms are masculine. Add gender checks on `person2` (the "other" person) since Arabic kinship terms describe the relationship **of person1 to person2**:

- `(1,0)`: "ابنه" → person1.gender=F ? "ابنته" : "ابنه"
- `(2,0)`: "حفيده" → person1.gender=F ? "حفيدته" : "حفيده"
- `(0,1)`: "أبوه" stays (father is always أب in this paternal tree)
- `(0,2)`: "جده" → if LCA is female (won't happen in paternal tree, but safe): "جدته" / "جده"
- `(1,1)` siblings: already gender-aware ✓
- `(1,2)`: "عمه" → person2.gender=F ? "عمته" : "عمه"
- `(2,1)`: "ابن أخيه" → person1.gender=F ? "ابنة أخيه" : "ابن أخيه"  
- `(2,2)`: "ابن عمه" → person1.gender=F ? "ابنة عمه" : "ابن عمه"
- `(1,3)`: "عم أبيه" → person2.gender=F ? "عمة أبيها" : "عم أبيه"
- `(3,1)`: "ابن ابن أخيه" → person1.gender=F ? "ابنة ابن أخيه"
- And so on for all entries, plus the generic fallback "قريبه" → "قريبته"/"قريبه"
- `≥3,0`: "حفيده" → gender of person1
- `0,≥3`: "جده" → stays (paternal ancestor)

### `asymTitle()` — same gender logic
Currently returns masculine-only titles. Each title needs a gender-aware version. Since `asymTitle` doesn't receive person objects, we need to pass the "subject" gender. Change signature to `asymTitle(myDist, otherDist, myGender?: string)`:
- "ابن" → gender=F ? "ابنة"
- "حفيد" → gender=F ? "حفيدة"
- "عم" → (this describes the other person's role, but `asymTitle` is called for both directions) — need to be careful: `title1to2` means "person1 is [X] of person2". So if person1 is female, use feminine form.
- "ابن أخ" → gender=F ? "ابنة أخ"
- etc.

### `lcaContextWord()` — add LCA gender param
- `(1,1)` "والدهما" stays
- Otherwise: LCA.gender=F ? "جدتهما المشتركة" : "جدهما المشترك"

### View components — LCA label
- KinshipCardView line 152: `"الجد المشترك"` → `result.lca?.gender === "F" ? "الجدة المشتركة" : "الجد المشترك"`
- KinshipTreeView line 47: same
- KinshipCardView lines 113,118: `"هو"` → `person1.gender === "F" ? "هي" : "هو"` (line 113), `person2.gender === "F" ? "هي" : "هو"` (line 118)

---

## FIX 2: Mother Name Prominence

### KinshipCardView `PersonChip`
- Import `inferMotherName` from familyService
- After branch badge, add: if `inferMotherName(member)` exists, show pill with gender-aware label:
  `member.gender === "M" ? "والدته" : "والدتها"` + `: ${motherName}`
- Style: `text-[10px] text-muted-foreground bg-muted/40 rounded px-2 py-0.5`

### KinshipTreeView endpoint nodes
- Import `inferMotherName`
- For person1 and person2 endpoint nodes only (isEnd=true), show mother name below name in `text-[10px] text-muted-foreground italic`

### KinshipDocumentView
- Already shows mothers but uses "والدة" (neutral). Change to gender-aware: `person1.gender === "M" ? "والدته" : "والدتها"` pattern

---

## FIX 3: PersonDetails Scrollable

### Mobile Drawer (`PersonDetails.tsx` line 297)
- `DrawerContent`: change `max-h-[85vh]` → `max-h-[92dvh]` and add `overflow-y-auto`
- Inner content should scroll properly

### Desktop Sheet (line 309)
- `SheetContent`: add `h-[92dvh] max-h-[92dvh]` and keep `overflow-y-auto`
- Make header sticky: wrap the close button area with `sticky top-0 bg-background/95 backdrop-blur-sm z-10`
- Add `pb-[env(safe-area-inset-bottom,1rem)]` to inner content div

---

## FIX 4: WhatsApp Sharing

### `KinshipCardView.tsx` `handleShare()`
Replace current logic with tiered approach:

1. Capture with `html2canvas(cardRef, { backgroundColor: '#F7F3EE', scale: 2, useCORS: true })`
2. Try `navigator.share({ files: [file] })` — if supported and succeeds, done
3. If file share unsupported/fails: open `wa.me/?text=...` with relationship text + shareUrl AND download the PNG
4. Button label: "شارك النتيجة" instead of "شارك على واتساب"
5. Remove the green WhatsApp color — use primary or neutral styling since it's a generic share button now

