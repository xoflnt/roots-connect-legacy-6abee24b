
# خطة التنفيذ — إصلاح الأعمار + واتساب + رحمه الله

## 1. إصلاح حساب الأعمار (المشكلة الرئيسية)

**السبب**: `parseArabicYear("١٣٨٩/١٢/١٢")` يحذف `/` ويقرأ كل الأرقام كرقم واحد `13891212` بدلاً من `1389`.

**الحل**: تعديل `parseArabicYear` في `src/utils/ageCalculator.ts` ليقسم على `/` أولاً ويأخذ الجزء الأول (السنة) فقط قبل التحويل.

```
"١٣٨٩/١٢/١٢" → split("/")[0] → "١٣٨٩" → 1389 ✓
"١٣٦٤" → بدون / → "١٣٦٤" → 1364 ✓
```

**الملف**: `src/utils/ageCalculator.ts`

---

## 2. انعكاس تاريخ الميلاد من الملف الشخصي

**المشكلة**: `handleSave` يحفظ التاريخ بصيغة `year/month/day` مثل `1400/5/12` لكن `parseArabicYear` يقرأها كرقم واحد ضخم.

**الحل**: إصلاح #1 أعلاه يحل المشكلة — بعد تقسيم `/` يأخذ السنة فقط.

بالإضافة: التأكد أن `member` في Profile يُعاد حسابه بعد `refreshMembers()` — حالياً `useMemo([currentUser])` لا يتغير بعد الحفظ. نضيف `refreshKey` محلي.

**الملف**: `src/pages/Profile.tsx`

---

## 3. أيقونة واتساب أصلية (بدلاً من Phone)

**الحل**: إنشاء مكون SVG `WhatsAppIcon` صغير يُستخدم في كل الأماكن بدلاً من `Phone` من lucide.

**الملفات المتأثرة**:
- `src/components/WhatsAppIcon.tsx` — **جديد**
- `src/components/FamilyCard.tsx` — استبدال `Phone`
- `src/components/ListView.tsx` — استبدال `Phone`
- `src/components/LineageView.tsx` — استبدال `Phone`
- `src/components/PersonDetails.tsx` — استبدال `Phone`
- `src/components/DataTableView.tsx` — استبدال `Phone`

---

## 4. "رحمه الله" / "رحمها الله" حسب الجنس

**الحل**: تعديل `HeritageBadge` ليقبل `gender` prop اختياري وعند `type="deceased"` يعرض "رحمها الله" للإناث.

ثم تمرير `gender` في كل مكان يُستخدم فيه HeritageBadge:
- `FamilyCard.tsx`
- `LineageView.tsx`

**الملف**: `src/components/HeritageBadge.tsx`, `src/components/FamilyCard.tsx`, `src/components/LineageView.tsx`

---

## 5. تقسيم الأبناء حسب الأمهات (تحسين باقي الصفحات)

حالياً التقسيم مطبق في:
- ✅ الشجرة (FamilyTree) — ممتاز
- ✅ القائمة (ListView) — مطبق
- ✅ التفاصيل (PersonDetails) — مطبق
- ✅ الجدول (DataTableView) — مطبق

التقسيم في **LineageView** لقسم الأبناء (سطر 289-321) يعرض الأبناء كقائمة مسطحة — نعدّله ليجمعهم حسب الأم مع ألوان مثل باقي الصفحات.

**الملف**: `src/components/LineageView.tsx`

---

## ملخص الملفات

| ملف | تغيير |
|---|---|
| `src/utils/ageCalculator.ts` | إصلاح parseArabicYear لتجاهل اليوم والشهر |
| `src/components/WhatsAppIcon.tsx` | **جديد** — أيقونة واتساب SVG |
| `src/components/HeritageBadge.tsx` | دعم gender لـ "رحمها الله" |
| `src/components/FamilyCard.tsx` | واتساب أيقونة + gender في HeritageBadge |
| `src/components/ListView.tsx` | واتساب أيقونة |
| `src/components/LineageView.tsx` | واتساب أيقونة + تقسيم أبناء بألوان + gender |
| `src/components/PersonDetails.tsx` | واتساب أيقونة |
| `src/components/DataTableView.tsx` | واتساب أيقونة |
| `src/pages/Profile.tsx` | refreshKey لإعادة حساب member بعد الحفظ |
