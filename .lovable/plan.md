

# خطة التنفيذ — زر حفظ جهة اتصال + إصلاح الزوجة + تواريخ البحث

## 1. زر حفظ جهة اتصال (vCard)

إنشاء دالة تولّد ملف `.vcf` (vCard) وتفتحه كتنزيل — هذا المعيار يعمل على جميع الأنظمة (iOS, Android, هواوي).

**ملف جديد**: `src/utils/vcard.ts`
- دالة `downloadVCard(name: string, phone: string)` تنشئ ملف VCF بالاسم والرقم وتطلب تنزيله

**الأماكن التي يظهر فيها الزر** (بجانب أيقونة الواتساب):
- `FamilyCard.tsx` — أيقونة صغيرة `UserPlus` بجانب واتساب
- `ListView.tsx` — نفس الشيء
- `LineageView.tsx` — نفس الشيء
- `PersonDetails.tsx` — زر كامل "حفظ في جهات الاتصال"
- `DataTableView.tsx` — أيقونة صغيرة

يظهر فقط إذا الشخص عنده `phone`.

---

## 2. إصلاح "الزوجة:" لتكون حسب الجنس

**المشكلة**: في `LineageView.tsx` سطر 286 يعرض "الزوجة:" لجميع الأشخاص بغض النظر عن جنسهم. لو الشخص أنثى مثل "نورة بنت محمد" ولها زوج، يظهر "الزوجة: اسم ذكر" وهذا خطأ.

**الحل**: تغيير النص حسب `member.gender`:
- ذكر → "الزوجة:" أو "الزوجات:" (حسب العدد)
- أنثى → "الزوج:"

نفس التعديل في `PersonDetails.tsx` (سطر 151 يعرض "الزوجات" دائماً).

---

## 3. إظهار التواريخ المحدّثة في نتائج البحث

**المشكلة**: `SearchBar.tsx` يستورد `familyMembers` الثابتة (سطر 5) بدلاً من `getAllMembers()`. و`memberLabel.ts` يبني `memberMap` من `familyMembers` الثابتة أيضاً (سطر 3).

**الحل**:
- `SearchBar.tsx`: استبدال `familyMembers` بـ `getAllMembers()` من `familyService`
- `memberLabel.ts`: استبدال `familyMembers` بـ `getAllMembers()` وإعادة بناء الـ map عند كل استدعاء (أو كـ lazy getter)

---

## ملخص الملفات

| ملف | تغيير |
|---|---|
| `src/utils/vcard.ts` | **جديد** — دالة توليد vCard |
| `src/components/FamilyCard.tsx` | زر حفظ جهة اتصال |
| `src/components/ListView.tsx` | زر حفظ جهة اتصال |
| `src/components/LineageView.tsx` | زر حفظ + إصلاح "الزوجة/الزوج" |
| `src/components/PersonDetails.tsx` | زر حفظ + إصلاح "الزوجات/الزوج" |
| `src/components/DataTableView.tsx` | زر حفظ جهة اتصال |
| `src/components/SearchBar.tsx` | `getAllMembers()` بدل `familyMembers` |
| `src/utils/memberLabel.ts` | `getAllMembers()` بدل `familyMembers` |

