
## الهدف
إصلاح مشكلة اختفاء نتائج البحث خلف لوحة المفاتيح على الجوال (خصوصًا iOS) + منع التكبير العرضي (double-tap zoom) بدون كسر تجربة تكبير الشجرة.

## ما تم اكتشافه من المراجعة
1. منطق `visualViewport` موجود حاليًا فقط في `SearchBar` وبشكل أساسي عند mount، وليس مُعاد ربطه عند كل `focus`.
2. عدة حقول بحث تستخدم Dropdown بدون حساب ديناميكي للمساحة المتبقية تحت الحقل:
   - `SearchBar` (الهيدر)
   - `LandingPage` search
   - `KinshipCalculator` (PersonPicker الشخص الأول والثاني)
   - `SubmitRequestForm`
   - `OnboardingModal` (خطوة البحث عن الاسم)
   - `Admin` export search
3. `index.html` لا يحتوي إعداد viewport المطلوب (maximum-scale + user-scalable=no).
4. لا يوجد `touch-action` عام لمنع double-tap zoom، ولا يوجد استثناء واضح لمناطق التكبير (الشجرة).

## خطة التنفيذ
1. إنشاء Hook موحّد لإدارة Dropdown الآمن مع الكيبورد (مثلاً: `useKeyboardSafeDropdown` في `src/hooks/`):
   - يحسب الارتفاع المتاح بالضبط:
     `window.visualViewport.height - input.getBoundingClientRect().bottom - 8`
   - يطبّق `max-height` ديناميكيًا على قائمة النتائج.
   - يعيد الحساب عند:
     - كل `focus` (مع إعادة ربط listeners كل مرة)
     - كل `resize` و`scroll` على `visualViewport`
     - كل `scroll` على الصفحة (capture)
     - كل keystroke (تغيّر query)
   - يضمن أن القائمة لا تتجاوز `visualViewport.height`.
   - عند فتح القائمة: `resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })`.

2. تعميم الـ hook على كل حقول البحث التي تعرض نتائج Dropdown:
   - `src/components/SearchBar.tsx` (mobile dialog + desktop dropdown)
   - `src/components/LandingPage.tsx`
   - `src/components/KinshipCalculator.tsx` (يشمل الشخص الثاني تلقائيًا لأن PersonPicker مشترك)
   - `src/components/SubmitRequestForm.tsx`
   - `src/components/OnboardingModal.tsx`
   - `src/pages/Admin.tsx`
   - لكل قائمة نتائج: ضبط `maxHeight` من hook + `overflow-y-auto`.
   - قاعدة العرض:
     - إذا النتائج متعددة: استهداف إظهار 3 عناصر على الأقل متى ما المساحة تسمح.
     - إذا نتيجة واحدة: تكون ظاهرة بالكامل دائمًا.

3. إصلاح viewport لمنع zoom العرضي:
   - تعديل `index.html` إلى:
     `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`.

4. CSS عالمي لمنع double-tap zoom على عناصر UI:
   - إضافة في `src/index.css`:
     - `* { touch-action: manipulation; }`
     - `button, a, input, select, textarea { touch-action: manipulation; }`

5. استثناء مناطق يجب أن تبقى قابلة للتكبير (الشجرة):
   - إضافة override واضح يسمح pinch داخل منطقة الشجرة (`FamilyTree`/ReactFlow) عبر class مخصص (مثل `allow-pinch-zoom`) أو selector مخصص لـ `.react-flow` بحيث تكون:
     `touch-action: pan-x pan-y pinch-zoom;`
   - تطبيقه على حاوية عرض الشجرة في `Index`/`FamilyTree`.

## تفاصيل تقنية (مختصرة)
- سيتم اعتماد refs لكل input + dropdown container.
- سيتم إعادة attach/detach listeners بأمان عند كل focus لمنع فقدان التتبع بعد النزول/الصعود في الصفحة.
- إعادة الحساب ستكون عبر `requestAnimationFrame` عند الحاجة لتقليل jitter.
- لن نعتمد `position: fixed` للقوائم لتجنب مشاكل iOS keyboard overlap.

## التحقق بعد التنفيذ
1. في iPhone/PWA: افتح البحث واكتب اسمًا حتى تظهر نتيجة واحدة — يجب أن تظهر كاملة فوق الكيبورد مباشرة.
2. كرر في:
   - الصفحة الرئيسية
   - حاسبة القرابة (خصوصًا الشخص الثاني)
   - onboarding search
3. مع نتائج متعددة: تظهر 3 نتائج على الأقل بدون scroll (عند توفر مساحة)، والباقي scroll داخلي.
4. اضغط مرتين سريعًا على الأزرار/عناصر التنقل: لا يحدث zoom.
5. داخل عرض الشجرة: التكبير/التصغير يظل يعمل (pinch/controls) ولا يتأثر بمنع zoom العرضي على عناصر UI.
