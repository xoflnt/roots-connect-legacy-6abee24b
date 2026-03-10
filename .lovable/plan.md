

# ألوان لكل فرع زوجة + إظهار الزوجة دائماً + تحسينات عامة

## التغييرات

### 1. إظهار عقدة الزوجة دائماً (حتى لو زوجة واحدة)
**`src/hooks/useTreeLayout.ts`** — تعديل المنطق ليُنشئ spouse node لكل أب عنده أبناء وأمهم معروفة، بغض النظر عن عدد الزوجات. إزالة شرط `fathersWithMultipleWives`.

### 2. ألوان مختلفة لكل فرع زوجة
**`src/hooks/useTreeLayout.ts`** — تعيين لون فريد لكل عقدة زوجة وحوافها من مجموعة ألوان محددة. تمرير `colorIndex` في `data` لكل spouse node و children nodes.

مجموعة الألوان (5 ألوان تدور):
```
rose/pink, amber/orange, teal, violet, emerald
```

**`src/components/SpouseCard.tsx`** — استقبال `colorIndex` وتطبيق اللون المناسب على الحدود والخلفية.

**`src/components/FamilyCard.tsx`** — إذا كان العضو مرتبط بفرع زوجة، يظهر شريط لوني جانبي صغير يوضح الفرع.

### 3. تحسينات عامة على الشجرة
- **`src/hooks/useTreeLayout.ts`**: زيادة `nodesep` إلى 100 و `ranksep` إلى 180 لتباعد أفضل
- **`src/components/FamilyCard.tsx`**: إضافة أيقونة متوفي (✦) بجانب التاريخ إذا كان `death_year` موجود، وتحسين hover effect
- **`src/components/SpouseCard.tsx`**: تحسين التصميم مع تأثير hover خفيف
- **`src/components/FamilyTree.tsx`**: تحسين أنماط الحواف (edges) بألوان تتبع فرع الزوجة

### 4. إضافة عقد زوجات بدون أبناء
**`src/hooks/useTreeLayout.ts`** — للأشخاص الذين عندهم `spouses` في البيانات لكن ما عندهم أبناء مسجلين، نضيف spouse nodes أيضاً (بدون حواف أبناء).

## الملفات المتأثرة

| File | Change |
|------|--------|
| `src/hooks/useTreeLayout.ts` | منطق جديد: spouse nodes لكل زوجة + ألوان + تباعد أفضل |
| `src/components/SpouseCard.tsx` | دعم ألوان متعددة حسب `colorIndex` |
| `src/components/FamilyCard.tsx` | شريط لوني جانبي للفرع + أيقونة متوفي |
| `src/components/FamilyTree.tsx` | لا تغيير كبير (nodeTypes مسجلة مسبقاً) |

## التفاصيل التقنية

الألوان تُعرّف كـ array ثابت في `useTreeLayout.ts`:
```ts
const BRANCH_COLORS = [
  { stroke: "hsl(340, 60%, 55%)", bg: "hsl(340, 50%, 94%)" },  // rose
  { stroke: "hsl(35, 70%, 50%)",  bg: "hsl(35, 60%, 93%)" },   // amber
  { stroke: "hsl(175, 50%, 40%)", bg: "hsl(175, 40%, 92%)" },  // teal
  { stroke: "hsl(270, 45%, 55%)", bg: "hsl(270, 35%, 93%)" },  // violet
  { stroke: "hsl(150, 50%, 40%)", bg: "hsl(150, 40%, 92%)" },  // emerald
];
```

كل spouse node يحصل على `colorIndex = counter++ % 5` وتُمرر للـ data. الحواف من الأب للزوجة ومن الزوجة للأبناء تأخذ نفس اللون.

