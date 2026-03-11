

# ترتيب الأبناء حسب تاريخ الميلاد + إصلاح اسم الأم

## مشكلتان

1. **الترتيب**: الأبناء يظهرون بترتيب إدخالهم في البيانات، وليس حسب العمر. المطلوب: الأكبر أولاً، ومن ليس له تاريخ ميلاد يُعتبر الأصغر.

2. **اسم الأم لا يظهر**: دالة `extractMotherName` تستخرج اسم الأم من حقل `notes` الخاص **بالشخص نفسه** فقط. لكن كثير من الأبناء ليس لديهم "والدته:" في ملاحظاتهم — المعلومة موجودة فقط عند بعض إخوانهم أو حتى في حقل `spouses` عند الأب. الحل: إذا لم يُوجد اسم الأم في ملاحظات الشخص، نبحث عند إخوانه (أبناء نفس الأب) الذين لديهم نفس الأم، أو نأخذها من حقل `spouses` عند الأب إذا كانت زوجة واحدة فقط.

---

## التغييرات

### 1. `src/services/familyService.ts` — دالة ترتيب مركزية + تحسين استخراج الأم

- إضافة دالة `sortByBirth(members: FamilyMember[]): FamilyMember[]` تستخدم `parseArabicYear` لترتيب الأبناء من الأكبر للأصغر، مع وضع من ليس له تاريخ ميلاد في الآخر.
- تحسين `extractMotherName` أو إضافة دالة `inferMotherName(member)` تبحث:
  1. أولاً في `notes` الشخص نفسه (الطريقة الحالية)
  2. إذا لم تجد: تبحث عند إخوانه (أبناء نفس الأب) اللي عندهم اسم أم في ملاحظاتهم — إذا كان الأب له زوجة واحدة فقط
  3. إذا لم تجد: تأخذ من حقل `spouses` عند الأب إذا كانت زوجة واحدة فقط

### 2. `src/hooks/useTreeLayout.ts` — ترتيب + استخدام الأم المُستنتجة

- ترتيب `childIds` داخل كل مجموعة أم بـ `sortByBirth` قبل إضافتها لـ dagre
- استخدام الدالة المحسنة بدل `extractMotherName` المباشرة لتعيين `childMotherMap`

### 3. `src/components/ListView.tsx` — ترتيب الأبناء في childrenMap

- عند بناء `childrenMap`، ترتيب الأبناء في كل مجموعة بـ `sortByBirth`

### 4. `src/components/PersonDetails.tsx` — ترتيب الأبناء

- ترتيب `children` بـ `sortByBirth` قبل العرض

### 5. `src/components/LineageView.tsx` — ترتيب الأبناء

- ترتيب قوائم الأبناء بـ `sortByBirth`

### 6. `src/components/DataTableView.tsx` — ترتيب افتراضي

- ترتيب `filtered` بـ `sortByBirth` كترتيب افتراضي

---

## الملفات المتأثرة

| ملف | تغيير |
|---|---|
| `src/services/familyService.ts` | إضافة `sortByBirth` + `inferMotherName` |
| `src/hooks/useTreeLayout.ts` | ترتيب الأبناء + استخدام `inferMotherName` |
| `src/components/ListView.tsx` | ترتيب في `childrenMap` |
| `src/components/PersonDetails.tsx` | ترتيب الأبناء |
| `src/components/LineageView.tsx` | ترتيب الأبناء |
| `src/components/DataTableView.tsx` | ترتيب افتراضي |

