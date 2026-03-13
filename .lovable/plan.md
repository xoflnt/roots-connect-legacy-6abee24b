

# إصلاح مشاكل البحث والصفحة البيضاء

## المشاكل المكتشفة

### 1. الشاشة تنزل بشكل غريب أثناء البحث
**السبب**: الـ hook `useKeyboardSafeDropdown` يستدعي `scrollIntoView` على dropdown كل ما تتغير النتائج أو يتحرك الـ viewport. هذا يسبب انتقال الصفحة بالكامل للأسفل بشكل مزعج.
**الحل**: حذف `scrollIntoView` من الـ hook — القائمة المنسدلة موجودة أصلاً تحت الحقل مباشرة ولا تحتاج scroll. كذلك حذف `scrollIntoView` من `SearchBar` في الـ `useEffect` الذي يراقب النتائج في الـ dialog (سطر 51).

### 2. صفحة بيضاء عند الضغط على اسم شخص
**السبب**: صفحة `PersonPage` تستدعي `getMemberById()` مباشرة بدون انتظار تحميل البيانات من السحابة. البيانات الثابتة (static) تُحمّل فوراً، لكن إذا الشخص موجود فقط في بيانات السحابة، يرجع `undefined` → تظهر رسالة "لم يتم العثور".
**الحل**: إضافة `loadMembers()` في `PersonPage` مع حالة تحميل، بنفس النمط المستخدم في `Index.tsx`.

## التغييرات

| الملف | التغيير |
|-------|---------|
| `src/hooks/useKeyboardSafeDropdown.ts` | حذف `scrollIntoView` من `recalc` |
| `src/components/SearchBar.tsx` | حذف `useEffect` الذي يستدعي `scrollIntoView` على أول نتيجة |
| `src/pages/PersonPage.tsx` | إضافة `loadMembers()` مع حالة loading قبل عرض المحتوى |

