

# تنفيذ باقي الخطة — الدفعة التالية

## الميزات المتبقية بالترتيب
| # | الميزة | الحالة |
|---|--------|--------|
| 1 | Deep Linking | ✅ تم |
| 2 | بطاقة WhatsApp فاخرة | ⬜ التالي |
| 3 | زر تكبير/تصغير الخط | ⬜ التالي |
| 4 | حاسبة القرابة | ⬜ التالي |
| 5 | شارات تراثية | ⬜ التالي |
| 6 | طبقة familyService | ⬜ التالي |

سأنفذ الجميع في هذه الدفعة.

---

## 1. بطاقة WhatsApp الفاخرة (Canvas API)

**ملف جديد:** `src/components/LineageShareCard.tsx`

- دالة `generateLineageImage(chain, url)` تستخدم Canvas API لرسم بطاقة PNG:
  - خلفية بتدرج رملي/أخضر تراثي
  - عنوان "بوابة آل الخنيني" في الأعلى
  - سلسلة النسب كاملة (اسم بن اسم بن اسم...)
  - عدد الأجيال
  - رابط الشخص في الأسفل
  - حجم 1080×1350px (مناسب لـ WhatsApp/Instagram)
- زر "تحميل البطاقة" بجانب زر "شارك النسب" الحالي في `LineageView.tsx`
- عند الضغط: يولّد الصورة ويحمّلها كـ PNG

**تعديل:** `src/components/LineageView.tsx` — إضافة زر التحميل

## 2. زر تكبير/تصغير الخط

**ملف جديد:** `src/contexts/FontSizeContext.tsx`
- 3 مستويات: `normal` (18px)، `large` (21px)، `xlarge` (24px)
- يُحفظ في `localStorage`
- يغيّر `font-size` على `<html>` مباشرة

**ملف جديد:** `src/components/FontSizeToggle.tsx`
- زر بأيقونة `AArrowUp` / `AArrowDown` من Lucide
- يتنقل بين المستويات الثلاث بالضغط
- يعرض مؤشر المستوى الحالي (أ، أأ، أأأ)

**تعديل:** `src/components/AppHeader.tsx` — إضافة الزر بجانب ThemeToggle
**تعديل:** `src/components/LandingPage.tsx` — إضافة الزر في صفحة الهبوط
**تعديل:** `src/App.tsx` — لف التطبيق بـ `FontSizeProvider`

## 3. حاسبة القرابة ("من أنا لك؟")

**ملف جديد:** `src/components/KinshipCalculator.tsx`
- واجهة: حقلي بحث (شخص 1 وشخص 2) مع autocomplete
- خوارزمية LCA (Lowest Common Ancestor): 
  - ابنِ سلسلة الأجداد لكل شخص
  - جد أول جد مشترك
  - احسب المسافة من كل شخص للجد المشترك
- ترجمة النتيجة للعربية:
  - مسافة (1,0) = "أبوه" / (0,1) = "ابنه"
  - مسافة (2,0) = "جده" / (1,1) = "أخوه"
  - مسافة (2,1) = "عمه" / (2,2) = "ابن عمه"
  - مسافة (3,2) = "ابن عم أبيه"
  - وهكذا مع التعميم
- عرض المسار البصري بين الشخصين كسلسلة مصغرة

**تعديل:** `src/components/AppHeader.tsx` — إضافة tab جديد "القرابة" في شريط التنقل
**تعديل:** `src/pages/Index.tsx` — إضافة عرض القرابة كـ view جديد

## 4. شارات تراثية (Heritage Badges)

**ملف جديد:** `src/components/HeritageBadge.tsx`
- مكون صغير يعرض شارة بناءً على خصائص الشخص:
  - **المؤسس** (crown icon): للشخص بدون `father_id` أو `id === "100"`
  - **أب الفرع** (git-branch icon): لمن له 5+ أبناء مباشرين
  - **رحمه الله** (star icon): لمن لديه `death_year`
  - **الجيل X**: شارة رقم الجيل

**تعديل:** `src/components/LineageView.tsx` — إضافة الشارات داخل كل بطاقة
**تعديل:** `src/components/FamilyCard.tsx` — إضافة شارة صغيرة على البطاقة

## 5. طبقة familyService

**ملف جديد:** `src/services/familyService.ts`
- `getAllMembers()` → `FamilyMember[]`
- `getMemberById(id)` → `FamilyMember | undefined`
- `getChildrenOf(id)` → `FamilyMember[]`
- `getAncestorChain(id)` → `FamilyMember[]`
- `searchMembers(query)` → `FamilyMember[]`
- `getDescendantCount(id)` → number
- حالياً تقرأ من `familyData.ts`، جاهزة للتحويل لـ Supabase لاحقاً

**تعديل:** تحديث `FamilyMember` interface لإزالة `[key: string]: unknown` وإضافة `Death_year` → `death_year` بشكل موحد

---

## ملخص الملفات

| الملف | العملية |
|-------|---------|
| `src/components/LineageShareCard.tsx` | جديد |
| `src/contexts/FontSizeContext.tsx` | جديد |
| `src/components/FontSizeToggle.tsx` | جديد |
| `src/components/KinshipCalculator.tsx` | جديد |
| `src/components/HeritageBadge.tsx` | جديد |
| `src/services/familyService.ts` | جديد |
| `src/components/LineageView.tsx` | تعديل |
| `src/components/AppHeader.tsx` | تعديل |
| `src/components/LandingPage.tsx` | تعديل |
| `src/components/FamilyCard.tsx` | تعديل |
| `src/pages/Index.tsx` | تعديل |
| `src/App.tsx` | تعديل |
| `src/data/familyData.ts` | تعديل (interface) |

