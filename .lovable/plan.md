

# تأنيث "والدته/والدتها" + تحسين البحث

## ١. تأنيث المصطلحات حسب الجنس

**المشكلة**: في `FamilyCard.tsx` و `ListView.tsx` و `LineageView.tsx` مكتوب "والدته:" بشكل ثابت بدون النظر لجنس الشخص. المفترض للبنت تكون "والدتها:".

**الحل**: تغيير النص الثابت إلى تعبير شرطي:
```
{member.gender === "F" ? "والدتها" : "والدته"}: {motherName}
```

**الملفات**:
- `src/components/FamilyCard.tsx` — سطر 116
- `src/components/ListView.tsx` — سطر 240
- `src/components/LineageView.tsx` — سطر 231

---

## ٢. تحسين البحث — تجاهل الهمزات + كلمة "بن/بنت"

**المشكلة**: البحث حالياً يستخدم `name.includes(query)` مباشرة، فلا يجد "اسامة" إذا كان الاسم "أسامة"، ولا "عبدالله علي" إذا كان الاسم "عبدالله بن علي".

**الحل**: إضافة دالة `normalizeForSearch(text)` في `src/services/familyService.ts`:
1. إزالة الهمزات: استبدال `أإآ` بـ `ا`، و `ؤ` بـ `و`، و `ئ` بـ `ي`، و `ة` بـ `ه`
2. إزالة كلمات "بن" و "بنت" للمقارنة
3. تطبيع المسافات

ثم استخدامها في:
- `src/components/SearchBar.tsx` — فلتر البحث (سطر 27-29)
- `src/services/familyService.ts` — دالة `searchMembers`
- `src/components/LandingPage.tsx` — إذا كان فيها بحث

**الملفات المتأثرة**:

| ملف | تغيير |
|---|---|
| `src/services/familyService.ts` | إضافة `normalizeForSearch` + تحديث `searchMembers` |
| `src/components/SearchBar.tsx` | استخدام `normalizeForSearch` في الفلتر |
| `src/components/FamilyCard.tsx` | تأنيث "والدته/والدتها" |
| `src/components/ListView.tsx` | تأنيث "والدته/والدتها" |
| `src/components/LineageView.tsx` | تأنيث "والدته/والدتها" |

