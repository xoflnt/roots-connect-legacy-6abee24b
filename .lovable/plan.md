

# خطة التنفيذ

## المشكلة 1: تاريخ الميلاد لا ينعكس على البطاقة

**السبب الجذري**: `familyService.ts` و `useTreeLayout.ts` يقرأان البيانات من المصفوفة الثابتة `familyMembers` مباشرة. عندما يحفظ المستخدم تاريخ ميلاده عبر `dataService.updateMember`، التغيير يُحفظ في localStorage فقط ولا ينعكس على الخرائط الثابتة (`memberMap`, `memberById`).

**الحل**: تعديل `familyService.ts` ليدمج overrides من localStorage عند بناء الخرائط. إضافة دالة `refreshMembers()` تُستدعى بعد أي `updateMember` أو `addMember` لتحديث الخرائط. نفس التعديل في `useTreeLayout.ts`.

**الملفات**: `src/services/familyService.ts`, `src/hooks/useTreeLayout.ts`, `src/pages/Profile.tsx`

---

## المشكلة 2: دمج الدليل في الرسالة الترحيبية وصفحة الهبوط

**التغييرات**:

### في `OnboardingModal.tsx`:
- **للمسجلين**: إضافة قسم دليل مختصر (3 بطاقات: تصفح الشجرة، البحث، الملف الشخصي) أسفل رسالة الترحيب مع زر "المزيد" يفتح `/guide`
- **لغير المسجلين**: الخطوة 2 موجودة فعلاً كدليل مختصر — نوسّعها بإضافة بطاقتين إضافيتين (حاسبة القرابة، جدول البيانات)

### في `LandingPage.tsx`:
- إضافة قسم "كيف تستخدم المنصة" بعد الإحصائيات مباشرة — 4 بطاقات مختصرة مع أيقونات (تصفح الشجرة، البحث، التسجيل، حاسبة القرابة) + زر "دليل الاستخدام الكامل" يفتح `/guide`

---

## ملخص الملفات المتأثرة

| ملف | تغيير |
|---|---|
| `src/services/familyService.ts` | دمج localStorage overrides في الخرائط + دالة `refreshMembers()` |
| `src/hooks/useTreeLayout.ts` | قراءة البيانات المحدّثة بدل الثابتة |
| `src/pages/Profile.tsx` | استدعاء `refreshMembers()` بعد الحفظ |
| `src/components/OnboardingModal.tsx` | دمج دليل مختصر في كلا الوضعين |
| `src/components/LandingPage.tsx` | قسم "كيف تستخدم المنصة" جديد |

