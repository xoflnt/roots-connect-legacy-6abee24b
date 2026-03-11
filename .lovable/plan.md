

# خطة التنفيذ — ركائز العائلة + فروع + إزالة "آل"

## الملخص

ثلاث مهام رئيسية: (1) إضافة قسم "ركائز العائلة" في الصفحة الرئيسية مع بطاقات تفاعلية للأعمام الثلاثة، (2) شارات الفرع على كل شخص + تبويبات فلترة في القوائم، (3) استبدال "آل الخنيني" بـ "الخنيني" في كل مكان.

---

## 1. دالة `getBranch` — تحديد فرع كل شخص

**ملف جديد**: `src/utils/branchUtils.ts`

```typescript
const PILLARS = { "300": "فرع ناصر", "400": "فرع عبدالعزيز", "200": "فرع محمد" };

export function getBranch(personId: string): { pillarId: string; label: string } | null
// يتتبع ancestor chain حتى يجد أحد الأعمام الثلاثة
```

دالة بسيطة تستخدم `getMemberById` لتتبع `father_id` للأعلى حتى تجد أحد الـ IDs الثلاثة.

---

## 2. قسم "ركائز العائلة" في الصفحة الرئيسية

**ملف**: `src/components/LandingPage.tsx`

- تغيير العنوان الرئيسي إلى **"بوابة تراث الخنيني - فرع الزلفي"**
- إضافة قسم جديد بعد Hero مباشرة يحتوي 3 بطاقات كبيرة أنيقة:
  - كل بطاقة تعرض: اسم العم + أيقونة تراثية + عدد الذرية + زر "تصفح الفرع"
  - زر "تصفح الفرع" يستدعي `onBrowseTree()` مع تمرير `branchId` عبر URL param

**ملف**: `src/pages/Index.tsx`
- تعديل `LandingPage` props لتقبل `onBrowseBranch(pillarId: string)`
- عند الضغط → `setActiveView("tree")` + تمرير `focusBranch` للشجرة

**ملف**: `src/components/FamilyTree.tsx`
- إضافة prop اختياري `focusBranch?: string` — عند وجوده يوسّع فقط ذرية هذا العم ويركز الشجرة عليه

---

## 3. شارة الفرع على بطاقات الأشخاص

**ملف**: `src/components/FamilyCard.tsx`
- إضافة شارة صغيرة (pill) تحت الاسم: "فرع ناصر" / "فرع عبدالعزيز" / "فرع محمد"
- لون ذهبي/أخضر خفيف حسب الفرع

**ملف**: `src/components/ListView.tsx`
- نفس الشارة بجانب اسم كل شخص في القائمة

---

## 4. تبويبات الفروع في عرض القوائم

**ملف**: `src/components/ListView.tsx`
- إضافة `Tabs` في الأعلى: "الكل" | "فرع ناصر" | "فرع عبدالعزيز" | "فرع محمد"
- عند اختيار فرع → فلترة `roots` لتعرض فقط ذرية العم المحدد
- الفلترة فورية بدون إعادة تحميل

---

## 5. إزالة "آل" من كل مكان

| ملف | التغيير |
|---|---|
| `index.html` سطر 7-8, 29-32 | إزالة "آل" من meta tags |
| `src/components/OnboardingModal.tsx` سطر 174, 256 | "بوابة تراث الخنيني" |
| `src/pages/Guide.tsx` سطر 152 | "بوابة تراث الخنيني" |
| `supabase/functions/wasage-otp/index.ts` سطر 47 | "بوابة الخنيني" |
| `src/components/LandingPage.tsx` سطر 156, 315, 356 | تحديث العناوين |
| `src/components/LineageShareCard.tsx` سطر 128 | "شجرة الخنيني" (بدون آل — محقق فعلاً) |

ملاحظة: سطر 315 يحتوي "آل حميد" و"آل حماد" — هذه أسماء قبائل مختلفة وليست عائلة الخنيني، لكن بحسب طلب المستخدم إزالة "آل" بالكامل، سنبقيها لأنها تشير لقبائل أخرى وليس لعائلة الخنيني.

---

## ملخص الملفات

| ملف | تغيير |
|---|---|
| `src/utils/branchUtils.ts` | **جديد** — `getBranch()` + ثوابت الأعمام |
| `src/components/LandingPage.tsx` | قسم ركائز العائلة + تحديث العناوين + إزالة آل |
| `src/pages/Index.tsx` | دعم `onBrowseBranch` + تمرير `focusBranch` |
| `src/components/FamilyTree.tsx` | `focusBranch` prop للتركيز على فرع محدد |
| `src/components/FamilyCard.tsx` | شارة الفرع |
| `src/components/ListView.tsx` | تبويبات فلترة + شارة الفرع |
| `index.html` | إزالة "آل" من meta |
| `src/components/OnboardingModal.tsx` | إزالة "آل" |
| `src/pages/Guide.tsx` | إزالة "آل" |
| `supabase/functions/wasage-otp/index.ts` | إزالة "آل" |

