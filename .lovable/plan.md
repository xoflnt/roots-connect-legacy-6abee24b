

# خطة التنفيذ — تحسينات شاملة

## 1. إصلاح تكرار الاسم في البحث

**المشكلة**: اسم مثل "عبدالله بن محمد" يظهر كـ "عبدالله بن محمد ← محمد ← زيد" — "محمد" يتكرر.

**الحل**: تعديل `getLineageLabel` في `src/utils/memberLabel.ts` ليستخرج الاسم الأول فقط (قبل "بن"/"بنت") للشخص نفسه، ثم يعرض سلسلة الأجداد بالاسم الأول فقط.

**النتيجة**: "عبدالله ← محمد ← زيد" بدلاً من "عبدالله بن محمد ← محمد ← زيد"

**الملفات**: `src/utils/memberLabel.ts` — تعديل الدالة فقط. جميع حقول البحث (SearchBar, LandingPage, OnboardingModal, KinshipCalculator, SubmitRequestForm) تستخدم هذه الدالة مسبقاً.

---

## 2. ربط الأبناء بالأم + ألوان حسب الأم

**آلية استخراج الأم**: البيانات الحالية تحتوي على "والدته: X" أو "والدتها: X" في حقل `notes`. ننشئ دالة `extractMotherName(member)` في `src/services/familyService.ts` تستخرج اسم الأم من الملاحظات.

**التغييرات**:
- `src/services/familyService.ts`: إضافة `extractMotherName(member)` 
- `src/hooks/useTreeLayout.ts`: تعديل بناء الشجرة ليستخدم اسم الأم المستخرج لتجميع الأبناء حسب الأم (بدلاً من `__unknown__` الحالي)
- `src/components/FamilyCard.tsx`: عرض اسم الأم على البطاقة بخط صغير ملون
- `src/components/PersonDetails.tsx`: عرض اسم الأم في التفاصيل
- `src/components/DataTableView.tsx`: عمود "الأم" إضافي

---

## 3. دليل استخدام المنصة

**ملف جديد**: `src/pages/Guide.tsx` — صفحة دليل شاملة بتصميم RTL

**المحتوى** (بدون صور حقيقية — رسوم تقريبية بـ CSS/icons):
- كيفية تصفح الشجرة (رسم تقريبي لبطاقات الشجرة مع أسهم)
- البحث عن الأفراد
- التسجيل والتحقق عبر واتساب
- الملف الشخصي والتعديل
- عرض النسب والقرابة
- الجدول والقائمة

**Route**: `/guide` في `App.tsx`
**ربط**: زر في AppHeader + رابط في LandingPage

---

## 4. البوب أب الترحيبي — تعديل السلوك

**التغييرات في `OnboardingModal.tsx`**:
- يظهر كل زيارة (إزالة شرط `hasSeenOnboarding`)
- إذا المستخدم مسجل: يعرض رسالة ترحيب + اختصار للملف الشخصي + زر الشجرة (بدون خطوات التسجيل)
- إذا غير مسجل: التدفق الحالي كاملاً

---

## 5. صفحة الملف الشخصي — تعديل مباشر

**تعديل `src/pages/Profile.tsx`** بالكامل:
- عرض البيانات الحالية (اسم، جوال، تاريخ ميلاد، زوجات، ملاحظات)
- **تعديل مباشر بدون موافقة المشرف**:
  - تعديل اسم الزوجة / إضافة زوجة / حذف زوجة
  - إضافة ابن/بنت مع تحديد الأم (dropdown من الزوجات)
  - تعديل/حذف الأبناء
  - تعديل التواريخ (ميلاد/وفاة) بـ Hijri Date Picker
- جميع التعديلات تُحفظ مباشرة عبر `updateMember` / `addMember` من `dataService.ts`

---

## 6. التواريخ الهجرية — يوم/شهر/سنة

**تعديل `HijriDatePicker`** ليدعم إرجاع القيمة كـ string بصيغة "يوم/شهر/سنة"

**استخدامه في**:
- صفحة الملف الشخصي (تعديل تواريخ الميلاد والوفاة)
- نموذج التسجيل (موجود فعلاً)
- نموذج طلب التعديل (بدل حقل نصي)

---

## 7. حساب الأعمار

`ageCalculator.ts` موجود فعلاً ويحسب العمر. التعديلات:
- `src/components/FamilyCard.tsx`: عرض العمر على البطاقة إذا التواريخ مكتملة
- `src/components/DataTableView.tsx`: عمود "العمر"
- `src/components/ListView.tsx`: عرض العمر بجانب التواريخ

---

## ملخص الملفات المتأثرة

| ملف | تغيير |
|---|---|
| `src/utils/memberLabel.ts` | إصلاح تكرار الاسم |
| `src/services/familyService.ts` | دالة `extractMotherName` |
| `src/hooks/useTreeLayout.ts` | تجميع الأبناء حسب الأم |
| `src/components/FamilyCard.tsx` | عرض الأم + العمر |
| `src/components/PersonDetails.tsx` | عرض الأم + الجوال |
| `src/components/DataTableView.tsx` | أعمدة: الأم + العمر |
| `src/components/ListView.tsx` | عرض العمر |
| `src/components/OnboardingModal.tsx` | ظهور كل زيارة + وضع مسجل |
| `src/pages/Profile.tsx` | تعديل مباشر شامل |
| `src/pages/Guide.tsx` | **جديد** — دليل الاستخدام |
| `src/App.tsx` | route `/guide` |
| `src/components/AppHeader.tsx` | رابط الدليل + أيقونة الحساب |
| `src/components/SubmitRequestForm.tsx` | استخدام HijriDatePicker للتواريخ |

