

# خطة التنفيذ — انعكاس البيانات + ألوان الزوجات + واتساب

## المشاكل المحددة

### 1. تاريخ الميلاد لا ينعكس على البطاقة
**السبب الجذري**: `useTreeLayout` يستخدم `useMemo([expandedIds])` — عند استدعاء `refreshMembers()` لا يُعاد حساب الشجرة لأن `expandedIds` لم يتغير.

**الحل**: إضافة `refreshKey` state في `FamilyTree.tsx` يزداد عند كل تغيير في البيانات عبر custom event. تمريره كـ dependency إضافية لـ `useTreeLayout`.

- `src/hooks/useTreeLayout.ts`: إضافة `refreshKey` parameter
- `src/components/FamilyTree.tsx`: الاستماع لـ `storage` event أو custom event `family-data-updated` لزيادة `refreshKey`
- `src/pages/Profile.tsx`: إطلاق `window.dispatchEvent(new Event('family-data-updated'))` بعد `refreshMembers()`

### 2. عرض جميع البيانات على بطاقات الشجرة
- `src/components/FamilyCard.tsx`: إضافة عرض رقم الجوال (أيقونة واتساب صغيرة إذا موجود)، عدد الأبناء
- `src/hooks/useTreeLayout.ts`: تمرير `phone` ضمن `data` للبطاقة (موجود فعلاً من `...member`)

### 3. حقل رقم الجوال في التسجيل (Onboarding)
- رقم الجوال المستخدم في التحقق **يُحفظ فعلاً** (سطر 139: `updateMember(selectedMember.id, { phone })`)
- لكن نضيف توضيح للمستخدم أن رقمه سيظهر للعامة

### 4. ألوان الزوجات عبر كامل المنصة
حالياً ألوان الأمهات تظهر فقط في الشجرة. التعديل يشمل:

- **`src/components/ListView.tsx`**: تجميع الأبناء حسب الأم (باستخدام `extractMotherName`)، تلوين كل مجموعة بلون مختلف، واستخدام `getAllMembers()` بدل `familyMembers` الثابتة
- **`src/components/LineageView.tsx`**: عرض اسم الأم بلون مميز بجانب كل شخص، واستخدام `getAllMembers()` بدل `familyMembers`
- **`src/components/PersonDetails.tsx`**: تلوين كل زوجة بلون مختلف في قسم الزوجات + عرض أبناء كل زوجة تحتها ملونين
- **`src/components/DataTableView.tsx`**: تلوين خلية الأم بلون الفرع المقابل

### 5. زر واتساب للتواصل
- **`src/components/LineageView.tsx`**: إضافة زر واتساب أخضر بجانب كل شخص لديه `phone`
- **`src/components/ListView.tsx`**: نفس الشيء
- **`src/components/PersonDetails.tsx`**: زر واتساب كبير إذا الرقم موجود
- الرابط: `https://wa.me/${phone.replace('+', '')}`

---

## ملخص الملفات المتأثرة

| ملف | تغيير |
|---|---|
| `src/hooks/useTreeLayout.ts` | إضافة `refreshKey` param |
| `src/components/FamilyTree.tsx` | استماع لـ event + تمرير `refreshKey` |
| `src/pages/Profile.tsx` | إطلاق event بعد الحفظ |
| `src/components/FamilyCard.tsx` | عرض الجوال + كل البيانات |
| `src/components/ListView.tsx` | ألوان الأمهات + واتساب + `getAllMembers()` |
| `src/components/LineageView.tsx` | ألوان الأمهات + واتساب + `getAllMembers()` |
| `src/components/PersonDetails.tsx` | ألوان الزوجات + واتساب |
| `src/components/DataTableView.tsx` | ألوان الأم |

