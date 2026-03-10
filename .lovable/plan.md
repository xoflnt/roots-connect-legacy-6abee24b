

# خطة التنفيذ — شجرة العائلة والتراث

## التحديث: استخدام dagre للتخطيط التلقائي

إضافة مكتبة `dagre` في الخطوة 5 لحساب مواقع العقد تلقائياً بدون تداخل، مع اتجاه من الأعلى للأسفل (TB).

## خطوات التنفيذ

### 1. تثبيت المكتبات
- `@xyflow/react` — المخطط التفاعلي
- `dagre` + `@types/dagre` — محرك التخطيط التلقائي

### 2. تحديث index.html
- إضافة خط Tajawal من Google Fonts
- `dir="rtl"` و `lang="ar"` على `<html>`
- تحديث العنوان إلى "شجرة العائلة"

### 3. تحديث index.css
- لوحة ألوان هادئة (أخضر ناعم، أزرق عميق، خلفية بيج)
- خط Tajawal، حجم أساسي 18px
- متغيرات الوضع الفاتح والداكن

### 4. إنشاء الملفات

| الملف | الوظيفة |
|---|---|
| `src/data/familyData.ts` | واجهة FamilyMember + البيانات العربية الـ 6 |
| `src/contexts/ThemeContext.tsx` | فاتح/داكن + حفظ في localStorage |
| `src/hooks/useTreeLayout.ts` | **dagre** لحساب المواقع → nodes + edges لـ React Flow |
| `src/components/FamilyCard.tsx` | عقدة مخصصة: اسم، سنوات، أزواج، لون حسب الجنس |
| `src/components/FamilyTree.tsx` | React Flow canvas مع إيماءات اللمس |
| `src/components/SearchBar.tsx` | بحث بالاسم → تركيز على العقدة |
| `src/components/ResetViewButton.tsx` | زر "إعادة الضبط" عائم |
| `src/components/PersonDetails.tsx` | لوحة جانبية (ديسكتوب) / سحب من الأسفل (موبايل) |
| `src/components/ThemeToggle.tsx` | زر تبديل الوضع مع نص |
| `src/components/AppHeader.tsx` | العنوان + البحث + تبديل الوضع |
| `src/pages/Index.tsx` | تجميع كل المكونات |

### 5. useTreeLayout مع dagre (

<lov-plan>

# خطة التنفيذ — شجرة العائلة والتراث

## التحديث: استخدام dagre للتخطيط التلقائي

إضافة مكتبة `dagre` في الخطوة 5 لحساب مواقع العقد تلقائياً بدون تداخل، مع اتجاه من الأعلى للأسفل (TB).

## خطوات التنفيذ

### 1. تثبيت المكتبات
- `@xyflow/react` — المخطط التفاعلي
- `dagre` + `@types/dagre` — محرك التخطيط التلقائي

### 2. تحديث index.html
- إضافة خط Tajawal من Google Fonts
- `dir="rtl"` و `lang="ar"` على `<html>`
- تحديث العنوان إلى "شجرة العائلة"

### 3. تحديث index.css
- لوحة ألوان هادئة (أخضر ناعم، أزرق عميق، خلفية بيج)
- خط Tajawal، حجم أساسي 18px
- متغيرات الوضع الفاتح والداكن

### 4. إنشاء الملفات

| الملف | الوظيفة |
|---|---|
| `src/data/familyData.ts` | واجهة FamilyMember + البيانات العربية الـ 6 |
| `src/contexts/ThemeContext.tsx` | فاتح/داكن + حفظ في localStorage |
| `src/hooks/useTreeLayout.ts` | dagre لحساب المواقع تلقائياً → nodes + edges |
| `src/components/FamilyCard.tsx` | عقدة مخصصة: اسم، سنوات، أزواج، لون حسب الجنس |
| `src/components/FamilyTree.tsx` | React Flow canvas مع إيماءات اللمس |
| `src/components/SearchBar.tsx` | بحث بالاسم → تركيز على العقدة |
| `src/components/ResetViewButton.tsx` | زر "إعادة الضبط" عائم |
| `src/components/PersonDetails.tsx` | لوحة جانبية (ديسكتوب) / drawer من الأسفل (موبايل) |
| `src/components/ThemeToggle.tsx` | زر تبديل الوضع مع نص |
| `src/components/AppHeader.tsx` | العنوان + البحث + تبديل الوضع |
| `src/pages/Index.tsx` | تجميع كل المكونات |

### 5. dagre layout logic

```text
const g = new dagre.graphlib.Graph()
g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 })
// إضافة كل عقدة بعرض 220 وارتفاع 140
// إضافة كل حافة (father_id → id)
dagre.layout(g)
// تحويل النتائج إلى React Flow nodes/edges
```

### 6. تجميع الصفحة الرئيسية
- ThemeProvider يلف التطبيق
- AppHeader ثابت في الأعلى
- FamilyTree يملأ باقي الشاشة
- PersonDetails يظهر عند النقر على بطاقة
- ResetViewButton عائم فوق المخطط

