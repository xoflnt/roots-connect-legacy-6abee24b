

# وضع التحقق من البيانات — Data Validation Mode

## التغييرات

### 1. `src/pages/Index.tsx`
- إضافة state: `activeView: 'tree' | 'table'`
- تمرير `activeView` و `setActiveView` إلى `AppHeader`
- عرض `FamilyTree` أو `DataTableView` حسب الحالة

### 2. `src/components/AppHeader.tsx`
- إضافة props: `activeView` و `onViewChange`
- إضافة زرين (ToggleGroup) بجانب شريط البحث: "عرض الشجرة" و "جدول البيانات"
- إخفاء البحث وزر Reset عند عرض الجدول

### 3. `src/components/DataTableView.tsx` (ملف جديد)
- جدول كامل العرض بـ ScrollArea
- الأعمدة: المعرف، الاسم، الجنس، الأب (مع اسم الأب بدل ID فقط)، الأم، الميلاد، الوفاة، الزوجات، ملاحظات
- صفوف مخططة (striped rows)
- تمييز `father_id` بلون مختلف (badge) لسهولة التتبع
- اتجاه RTL للجدول
- دعم الوضع الداكن

