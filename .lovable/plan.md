

# ترقية بصرية وتجربة استخدام شاملة لأوضاع الشجرة الثلاثة

## الملفات المتأثرة (4 فقط)
| ملف | نوع التغيير |
|-----|-------------|
| `src/components/tree/SmartNavigateView.tsx` | إعادة كتابة كبيرة: swipe، بحث، بطاقات، breadcrumb |
| `src/components/tree/BranchesView.tsx` | ترقية بصرية: أيقونات جنس، شارات، indent |
| `src/components/tree/TreeModeSwitcher.tsx` | إضافة خط ذهبي + backdrop-blur |
| `src/components/FamilyTree.tsx` | إضافة زر "أين أنا؟" + toggle MiniMap |

---

## 1. SmartNavigateView — إصلاح Swipe

**الحالي**: `onTouchStart` + `onTouchEnd` فقط، threshold 50px، بدون feedback بصري.

**التغيير**:
- إضافة `onTouchMove` handler يحسب `dx` ويطبق `transform: translateX(dx)` على container المحتوى
- تخفيض threshold إلى 30px
- تغيير شرط الإلغاء: `Math.abs(dy) > Math.abs(dx) * 1.5` بدل `Math.abs(dy) > Math.abs(dx)`
- إضافة state `swipeOffset` يُطبق كـ inline `transform` مع `transition: transform 0.15s ease`
- عند إكمال swipe: animate snap ثم navigate
- عند إلغاء: spring back بـ `transition: transform 0.3s ease`
- إضافة ref `isSwiping` لمنع تشغيل حركة الـ slide animation أثناء الـ swipe

## 2. SmartNavigateView — إصلاح البحث

**الحالي**: overlay كامل الشاشة `absolute inset-0 z-50 bg-background/95`.

**التغيير**:
- حذف الـ overlay بالكامل
- استبداله بـ `Sheet` من shadcn (side="bottom")
- `SheetTitle`: "ابحث في الشجرة"
- `SearchBar` داخل الـ Sheet
- عند الاختيار: إغلاق Sheet + `navigateTo(id, "none")`

## 3. SmartNavigateView — البطاقة المركزية

**التغيير**:
- خلفية: `bg-card/95 backdrop-blur-sm`
- حدود: `border-[hsl(var(--male)/0.35)]` أو `--female`
- شريط فرع عمودي: `absolute right-0 top-3 bottom-3 w-1.5 rounded-full` بلون `branchStyle.text`
- خط ذهبي علوي للأعمدة (ids `200`,`300`,`400`): `absolute top-0 left-4 right-4 h-0.5 bg-accent/60`
- أيقونة الشخص: `w-10 h-10 rounded-xl` بدل `rounded-full`، بألوان الجنس (`bg-[hsl(var(--male)/0.15)] text-[hsl(var(--male))]`)
- استبدال ✅ بـ `BadgeCheck` icon أخضر
- والدته: pill ملونة بلون الفرع 15% alpha
- الزوجات: `Heart` icon قبل كل اسم
- شارات `HeritageBadge`: founder, branchHead (`isBranchHead(member.id)`), deceased (مع `gender`), documenter (`DOCUMENTER_ID`)
- `hover:shadow-xl hover:-translate-y-0.5 transition-all`
- ظل: `shadow-xl`

## 4. SmartNavigateView — بطاقة الأب

- أيقونة جنس: `w-8 h-8 rounded-lg` بألوان الجنس بدل `rounded-full bg-muted`
- شريط فرع: `absolute right-0 top-2 bottom-2 w-1 rounded-full`
- عرض `birth_year` إذا متوفر
- `ChevronUp` icon + "الأب" بدون ↑
- `HeritageBadge type="deceased" gender={member.gender}` إذا متوفى
- خلفية: `bg-card/80 backdrop-blur-sm`

## 5. SmartNavigateView — بطاقات الأبناء

- عرض: `w-[160px]` بدل `w-[140px]`
- حدود جنس: `border-r-2` بلون `--male/0.3` أو `--female/0.3`
- أيقونة جنس صغيرة: `w-6 h-6 rounded-md`
- شارة deceased مع gender
- نص "له/لها X أبناء" حسب الجنس
- `BadgeCheck` بدل ✅
- `hover:shadow-md hover:scale-[1.02] transition-all`
- `animationDelay: index * 0.05s` مع `animate-fade-in`، max 6 بطاقات (0.3s)

## 6. SmartNavigateView — Breadcrumb

**الحالي**: يعرض كل الأجداد (قد يكونون 7+).

**التغيير**:
- إذا `ancestorChain.length > 4`: عرض أول جد + "..." + آخر جدين + الحالي
- إذا `< 380px`: عرض الحالي + الأب فقط
- "..." غير قابلة للضغط

## 7. BranchesView — صفوف الأشخاص

- أيقونة جنس: نقطة ملونة `w-2 h-2 rounded-full` بلون `--male` أو `--female` قبل الاسم
- `HeritageBadge deceased` مع `gender={member.gender}`
- `HeritageBadge founder` لـ ids `100`,`200`,`300`,`400`
- `HeritageBadge branchHead` إذا `isBranchHead(member.id)`
- `BadgeCheck` icon بدل ✅ emoji
- والدته: pill صغيرة muted إذا `inferMotherName` أعاد قيمة
- depth > 4: حدود يمنى `dashed` بلون الفرع 30% alpha
- شفافية الحدود اليمنى حسب العمق: depth 0-1=80%, 2=65%, 3=50%, 4+=35%

## 8. TreeModeSwitcher

- خط ذهبي علوي: `<div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />`
- خلفية: `bg-background/90 backdrop-blur-md border-b border-border/40`
- الزر النشط: يبقى كما هو (pill ملونة)

## 9. FamilyTree — زر "أين أنا؟" + MiniMap toggle

- استيراد `useAuth` + `LocateFixed` + `Eye`/`EyeOff` من lucide
- إضافة state `showMiniMap` (default true)
- إضافة زرين جديدين في panel الـ zoom الحالي (bottom-left):
  - **أين أنا؟**: `LocateFixed` icon, `onClick: fitView({ nodes: [{ id: memberId }], duration: 600, padding: 0.5 })`
  - **MiniMap toggle**: `Eye`/`EyeOff` icon, toggles `showMiniMap`
- عرض `<MiniMap>` فقط إذا `showMiniMap === true`
- كلا الزرين يتبعان نفس تصميم أزرار zoom الحالية (`w-11 h-11`)

## 10. تلميع عام

- كل `HeritageBadge type="deceased"` يمرر `gender={member.gender}`
- كل ✅ emoji يُستبدل بـ `<BadgeCheck className="h-4 w-4 text-[#22c55e]" />`
- نص أبناء gender-aware: `member.gender === "F" ? "لها" : "له"` في كل الأوضاع
- `prefers-reduced-motion`: لا حركات جديدة مطلوب إضافتها خارج ما يوفره Tailwind

