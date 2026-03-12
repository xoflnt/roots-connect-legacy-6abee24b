

# Access Control, Admin Export & Guest Experience

## 1. Remove "البيانات" tab from public navigation

**`src/components/AppHeader.tsx`**: Remove `table` from `navItems` array.

**`src/pages/Index.tsx`**: Remove `table` from `VALID_VIEWS`, remove `DataTableView` import and its render block. Remove `"table"` case.

## 2. Move DataTableView into Admin Dashboard + CSV Export

**`src/pages/Admin.tsx`**:
- Add tabs: "الطلبات" (requests, current content) and "السجل الكامل" (full registry with `DataTableView`).
- Add "تصدير السجل الكامل (CSV)" button above the table tab.
- CSV export function: iterate `getAllMembers()`, build CSV string with BOM (`\uFEFF`), columns: ID, Name, Gender, Father ID, Birth Year, Death Year, Spouses, Phone, Notes. Create Blob and trigger download.
- Import `Tabs, TabsList, TabsTrigger, TabsContent` and `DataTableView`, `Download` icon.

## 3. Dynamic welcome message in header

**`src/components/AppHeader.tsx`**:
- If `!isLoggedIn`: show "مرحباً بك في بوابة تراث الخنيني" text (no click).
- If `isLoggedIn`: keep existing "مرحباً، [name]" clickable to profile.

## 4. Guest CTA banner on Landing Page

**`src/components/LandingPage.tsx`**:
- After search section (line ~219), if `!currentUser`, render a styled banner:
  - Green/sand gradient card with text: "هل أنت من أبناء العائلة؟ سجل دخولك الآن باستخدام رمز العائلة لتوثيق بياناتك، تحديث تواريخ ميلاد أبنائك، والحصول على شارة التوثيق ✅."
  - Button "تسجيل الدخول" that sets state `forceOnboarding=true` and passes it to `OnboardingModal`.
- Add `forceOnboarding` state, pass `forceOpen={forceOnboarding}` to `OnboardingModal`, reset on close.

## Files

| File | Change |
|---|---|
| `src/components/AppHeader.tsx` | Remove `table` from navItems, dynamic welcome text |
| `src/pages/Index.tsx` | Remove table view and DataTableView import |
| `src/pages/Admin.tsx` | Add tabs with DataTableView + CSV export with BOM |
| `src/components/LandingPage.tsx` | Add guest CTA banner with OnboardingModal trigger |

