

# خطة شاملة: ترقية المنصة إلى بوابة تفاعلية كاملة

## المتطلبات الأساسية

**تفعيل Lovable Cloud** مطلوب أولاً لـ:
- تخزين مفتاح wasage API كـ secret آمن
- إنشاء Edge Function لإرسال OTP عبر واتساب
- لا يمكن استدعاء wasage.com مباشرة من المتصفح (CORS + أمان المفتاح)

---

## الملفات الجديدة (8 ملفات)

### 1. `supabase/functions/wasage-otp/index.ts` — Edge Function
- يستقبل طلبات `POST /send` و `POST /verify`
- يقرأ `WASAGE_API_KEY` من Deno.env
- يستدعي `https://api.wasage.com/v1/otp/send` و `/otp/verify`
- يتعامل مع CORS headers

### 2. `src/services/dataService.ts` — خدمة البيانات
- `getMembers()`, `updateMember(id, data)`, `addMember(data)` — async functions
- `submitRequest(request)`, `getRequests()`, `approveRequest(requestId)`
- تستخدم localStorage حالياً مع بنية جاهزة للتحويل لـ Supabase
- الطلبات: `{ id, type, targetMemberId, data, status, createdAt }`

### 3. `src/utils/ageCalculator.ts` — حاسبة العمر
- `parseArabicYear(str)` — يحول "١٣٨٩" إلى 1389
- `calculateAge(birthYear, deathYear?, currentHijriYear = 1447)` — يرجع العمر
- `formatAge(age, isDeceased)` — يرجع "العمر: ٥٨ سنة" أو "توفي عن عمر يناهز ٧٦ سنة"

### 4. `src/components/HijriDatePicker.tsx` — منتقي التاريخ الهجري
- 3 Select dropdowns: يوم (1-30)، شهر (محرم-ذو الحجة)، سنة (1300-1447)
- يرجع string بصيغة "YYYY/MM/DD"

### 5. `src/components/SubmitRequestForm.tsx` — نموذج الطلبات
- يعمل من الـ Landing Page أو من بطاقة شخص
- Combobox لاختيار "الشخص المعني" (إذا فُتح من Landing)
- حقول ديناميكية حسب نوع الطلب (إضافة ابن، تعديل بيانات، إلخ)
- حقل "ملاحظات إضافية" textarea

### 6. `src/pages/Admin.tsx` — لوحة الأدمن
- **إحصائيات**: زيارات (mock), حسابات موثقة, إجمالي أفراد
- **صندوق الطلبات**: بطاقات للطلبات المعلقة
- **زر "موافقة وتحديث تلقائي"** — يستدعي `dataService.approveRequest()` ويحدث البيانات فوراً
- محمي بتحقق بسيط (كلمة مرور في localStorage مؤقتاً)

### 7. `src/components/AdminProtect.tsx` — حماية صفحة الأدمن
- يطلب كلمة مرور بسيطة للدخول (مؤقتاً حتى ربط auth حقيقي)

### 8. `supabase/config.toml` — إعدادات Edge Function
```toml
[functions.wasage-otp]
verify_jwt = false
```

---

## الملفات المعدّلة (6 ملفات)

### `src/services/wasageSms.ts`
- بدلاً من mock، يستدعي Edge Function `wasage-otp`
- يستخدم `supabase.functions.invoke()` أو fetch مباشر للـ Edge Function URL
- يحتفظ بـ fallback mock إذا لم يتوفر الـ project ID

### `src/components/OnboardingModal.tsx`
- يستبدل حقل تاريخ الميلاد النصي بـ `HijriDatePicker` (3 dropdowns)
- بعد التحقق من OTP وإدخال التاريخ → يستدعي `dataService.updateMember()` لتحديث البيانات تلقائياً

### `src/components/LandingPage.tsx`
- يعرض `<OnboardingModal />` مباشرة في صفحة الهبوط (بدلاً من عرضه فقط في الشجرة)
- يضيف زر "سجّل بياناتك" أو "أرسل طلب تعديل" يفتح `SubmitRequestForm`

### `src/pages/Index.tsx`
- ينقل `<OnboardingModal />` ليُعرض دائماً (سواء في landing أو في الشجرة)

### `src/components/PersonDetails.tsx`
- يضيف عرض العمر المحسوب باستخدام `ageCalculator`
- يضيف زر "طلب تعديل" يفتح `SubmitRequestForm` مع تمرير الشخص المحدد

### `src/App.tsx`
- يضيف route `/admin` → `<Admin />`

---

## خطوات التنفيذ

1. تفعيل Lovable Cloud (مطلوب قبل البدء)
2. إنشاء Edge Function + تخزين WASAGE_API_KEY كـ secret
3. تحديث `wasageSms.ts` لاستدعاء Edge Function
4. نقل OnboardingModal للـ Landing Page
5. إنشاء HijriDatePicker وتحديث OnboardingModal
6. إنشاء ageCalculator وتحديث PersonDetails
7. إنشاء dataService
8. إنشاء SubmitRequestForm
9. إنشاء Admin Dashboard
10. إضافة route الأدمن

---

## ملاحظة مهمة
**الخطوة الأولى**: يجب تفعيل Lovable Cloud من إعدادات المشروع قبل أن أتمكن من إنشاء Edge Function وتخزين مفتاح wasage. هل تريد تفعيله الآن؟

