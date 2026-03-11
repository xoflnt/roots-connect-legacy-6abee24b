

# إضافة شارات الفروع في كل مكان

شارات الفروع (فرع ناصر / فرع عبدالعزيز / فرع محمد) موجودة في `FamilyCard.tsx` و `ListView.tsx` فقط. المطلوب إضافتها في:

## التغييرات

### 1. `src/components/LineageView.tsx`
- استيراد `getBranch, getBranchStyle` من `branchUtils`
- في قسم الشارات (سطر 233-238)، إضافة شارة الفرع كأول شارة قبل المؤسس والمتوفى

### 2. `src/components/PersonDetails.tsx`
- استيراد `getBranch, getBranchStyle`
- إضافة بطاقة معلومات جديدة للفرع بعد شارة الجنس (سطر 75) — نفس تنسيق بطاقات المعلومات الأخرى

### 3. `src/components/DataTableView.tsx`
- استيراد `getBranch, getBranchStyle`
- إضافة عمود "الفرع" في الجدول بعد عمود الاسم (سطر 169)
- عرض شارة ملونة بالفرع في كل صف

