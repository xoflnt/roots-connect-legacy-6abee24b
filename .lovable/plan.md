

# إضافة أوضاع عرض متعددة لشجرة العائلة على الموبايل

## الملخص
إضافة شريط تبديل أوضاع داخل عرض الشجرة مع وضعين جديدين (تنقل + فروع) مع الحفاظ على الخريطة والقائمة الحاليتين.

## البنية المعمارية

```text
Index.tsx (activeView = "tree")
  └─ TreeExplorer.tsx (جديد — يحل محل <FamilyTree> المباشر)
       ├─ TreeModeSwitcher.tsx (شريط التبديل بين 4 أوضاع)
       ├─ SmartNavigateView.tsx (وضع التنقل 🧭)
       ├─ BranchesView.tsx (وضع الفروع 🌿)
       ├─ FamilyTree.tsx (الخريطة الحالية — بدون تعديل)
       └─ ListView.tsx (القائمة الحالية — بدون تعديل)
```

## الملفات الجديدة

### 1. `src/components/tree/TreeModeSwitcher.tsx`
- شريط 4 أوضاع: تنقل | فروع | خريطة | قائمة
- `ToggleGroup` مع أيقونات + نص (أيقونات فقط على شاشات `< 380px`)
- يحفظ الاختيار في `localStorage("khunaini-tree-mode")`
- الافتراضي: "navigate" على الموبايل، "map" على الديسكتوب
- تصميم: `bg-card/90 backdrop-blur border rounded-2xl shadow-sm` ثابت أعلى المحتوى

### 2. `src/components/tree/SmartNavigateView.tsx` — الوضع الأهم
**البنية العمودية:**
1. **Breadcrumb** (أعلى): سلسلة من الجذر للشخص الحالي، scroll أفقي RTL، كل عنصر قابل للضغط
2. **بطاقة الأب** (اختيارية): بطاقة متوسطة، ضغطها يجعله المركز
3. **البطاقة المركزية**: كبيرة، ظل بارز، حدود بلون الفرع، تعرض: الاسم + الفرع + العمر + الشارات + الزوجات + عدد الأبناء. أسهم ← → للتنقل بين الأشقاء. سحب أفقي (swipe) للتنقل أيضاً. الضغط يفتح `PersonDetails`
4. **صف الأبناء**: scroll أفقي، يعرض ~2.5 بطاقة لإيحاء بالمزيد. كل بطاقة: اسم + عمر + "له X أبناء". الضغط يجعله المركز

**المنطق:**
- `currentId` state — يبدأ بـ `currentUser?.memberId || "100"`
- `history` stack — زر رجوع يعود للسابق
- `siblings` = أبناء نفس الأب، مرتبين بالميلاد
- `siblingIndex` للتنقل بالأسهم
- يستخدم `getMemberById`, `getChildrenOf`, `getAncestorChain` من `familyService`
- `React.memo` على كل بطاقة فرعية
- زر بحث عائم 🔍 يفتح `SearchBar` ويوجه النتيجة لـ `setCurrentId`

**الحركات:**
- تغيير `currentId` → `animate-slide-up` (للابن), `animate-slide-down` (للأب), `animate-slide-left/right` (للأشقاء)
- CSS `transition` مع `@media (prefers-reduced-motion: reduce)` تعطيل

### 3. `src/components/tree/BranchesView.tsx` — وضع الفروع
- 3 بطاقات رأس (PILLARS) بألوان الفروع + عدد الأفراد لكل فرع
- الضغط يوسع/يطوي الفرع (accordion)
- داخل كل فرع: `BranchNode` recursive component — اسم + عمر + شارة جيل + عدد أبناء
- indent: `paddingRight: depth * 16px` (max 4 levels indent)
- شارة الجيل: "الجيل ٣" محسوبة من `getDepth()`
- الضغط على شخص يفتح `PersonDetails`
- Lazy: الأبناء يُحسبون فقط عند التوسيع
- `React.memo` على `BranchNode`

### 4. `src/components/tree/TreeExplorer.tsx` — المنسق
- يقرأ الوضع من localStorage (أو يختار حسب `useIsMobile`)
- يعرض `TreeModeSwitcher` + المحتوى المناسب
- يمرر `focusBranch` و `treeRef` لوضع الخريطة
- يمرر `onSelectMember` لوضع القائمة والفروع
- يدير `PersonDetails` drawer مشترك لوضعي التنقل والفروع

## التعديلات على ملفات موجودة

### `src/pages/Index.tsx`
- استبدال `<FamilyTree>` و `<ListView>` المباشرين في وضع "tree"/"list" بـ `<TreeExplorer>` واحد عندما يكون `activeView === "tree"`
- وضع "list" يبقى مستقل أيضاً (من الـ AppHeader bottom nav)
- تمرير `focusBranch` و `treeRef` كما هو

### `src/components/AppHeader.tsx`
- لا تغيير — القائمة السفلية تبقى كما هي (الشجرة/النسب/القرابة/القوائم)

### `src/components/FamilyTree.tsx`
- إضافة خاصية اختيارية: `initialFocusMemberId?: string` — عند التحميل يفعل `fitView` على هذا الشخص
- إضافة زر "أين أنا؟" يعيد التمركز على المستخدم المسجل
- MiniMap موجود بالفعل — إضافة زر toggle لإخفائه/إظهاره
- أزرار zoom موجودة بالفعل بحجم 44px

### `tailwind.config.ts`
- إضافة keyframes: `slide-down`, `slide-left`, `slide-right` (يوجد `slide-up` بالفعل)

## ملاحظات تقنية
- لا يُحذف أي كود حالي
- `PersonDetails` يُعاد استخدامه كما هو (drawer/sheet)
- البيانات من `familyService` فقط — لا استعلامات DB جديدة
- جميع النصوص بالعربية، RTL، خط Tajawal
- جميع الأزرار `min-h-[44px] min-w-[44px]`
- `prefers-reduced-motion` يعطل الحركات

