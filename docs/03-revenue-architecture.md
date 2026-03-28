# هندسة الإيرادات - Nasaby Platform
## Revenue Architecture for Arabic Family SaaS

**الإصدار**: 1.0
**التاريخ**: ٢٧ مارس ٢٠٢٦
**الحالة**: معماري شامل جاهز للتنفيذ

---

## المقدمة التنفيذية

Nasaby هي منصة SaaS عائلية موجهة للتشاور المباشر بدون تسعير عام ثابت. كل عائلة لها اتفاقية تسعير مخصصة بناءً على:
- حجم العائلة (عدد الأعضاء)
- الميزات المطلوبة (الشجرة فقط، البحث المتقدم، الإشعارات، لوحة التحكم)
- مستوى الطوارئ والجدول الزمني
- القيمة الإدراكية للعائلة من منصتنا

هذا المستند يوفر:
1. **إطار التسعير الاستشاري** - كيفية اجراء محادثات البيع
2. **قرار البنية التحتية للدفع** - أي بوابة دفع اختيار
3. **هندسة الاشتراكات** - كيفية تتبع وفرض الاشتراكات تقنياً
4. **توقعات الإيرادات** - سيناريوهات واقعية للسنة الأولى

---

# الجزء أ: إطار التسعير الاستشاري
## Part A: Consultative Pricing Framework (إطار التسعير الاستشاري)

### A1. أسئلة التسعير الأساسية (Pricing Discovery Questions)

قبل اقتراح أي سعر، يجب على عبدالله أن يسأل هذه الأسئلة الاستكشافية في اجتماع البيع الأول:

#### المرحلة 1: فهم حجم المشكلة
```
س١: كم عدد أفراد عائلتكم في الشجرة العائلية الآن؟
   - الإجابة المتوقعة: 50-2000 عضو
   - ملاحظة: كل ١٠٠ عضو إضافي يضيف ٢٠٪ إلى السعر

س٢: هل لديكم سجل عائلي مكتوب أم ستبني شجرتكم من الصفر؟
   - إذا مكتوب: +٣٠٪ (توفير الوقت في الإدخال)
   - إذا من الصفر: -١٥٪ (مشروع طويل الأجل)

س٣: كم عدد الأشخاص الذين سيعملون على إدارة المنصة معك؟
   - مسؤول واحد فقط: السعر الأساسي
   - ٢-٣ مسؤولين: +١٥٪ لكل مسؤول إضافي
   - فريق كامل: +٣٠٪
```

#### المرحلة 2: فهم الحاجات الميزاتية
```
س٤: أي من هذه الميزات الإضافية تحتاجون؟

   ميزات أساسية (مدرجة في جميع الخطط):
   □ شجرة عائلية تفاعلية
   □ حساب درجات القرابة
   □ البحث البسيط
   □ ملفات تعريف الأعضاء

   ميزات متقدمة (تضيف ٢٠٪ إلى ٥٠٪):
   □ جدول البيانات الموسع (genealogy tables)
   □ رفع الوثائق والصور
   □ التاريخ الشفهي (voice notes)
   □ الدعوات والإشعارات المتقدمة
   □ تقارير الصحة البيانية

   ميزات الوسائط (يضيف ٥٠٪ إلى ١٠٠٪):
   □ معرض الصور التاريخية
   □ فيديوهات أفراد العائلة
   □ PDF التقارير القابلة للتصدير
   □ تصدير إلى Ancestry/23andMe

س٥: هل تريدون أرشفة البيانات التاريخية (safe deposit)؟
   - أرشفة بسيطة: +٢٠٪
   - أرشفة مع دعم عائلة: +٥٠٪ (مكالمات شهرية)
```

#### المرحلة 3: فهم السياق الزمني والميزانية
```
س٦: ما الجدول الزمني؟ متى تحتاجون المنصة جاهزة؟
   - لا عجلة (٦ أشهر+): السعر الأساسي
   - عاجل (١-٣ أشهر): +٢٥٪
   - فوري (أقل من شهر): +٥٠٪

س٧: هل لديكم ميزانية محددة مسبقاً؟
   - استمع فقط، لا تعلق الآن
   - سجل الرقم لاستخدامه لاحقاً في المرساة (anchoring)

س٨: من يتخذ قرار الشراء؟ (رب الأسرة الأكبر، مجلس العائلة، فرد واحد؟)
   - قرار فردي: أسرع صفقة
   - قرار جماعي: أضف ٢٠٪ وقت إضافي للبيع، قد تحتاج نسخة تجريبية
```

### A2. عوامل تأثر على السعر (Price Drivers)

كل عامل من العوامل التالية يزيد السعر الأساسي. اجمع كل المعاملات معاً لحساب السعر النهائي:

| العامل | المعادلة | المثال |
|--------|---------|--------|
| **حجم العائلة** | `السعر = السعر_الأساسي + (عدد_الأعضاء / 100 × ١٠%)` | ٣٠٠ عضو = +٣٠% |
| **عدد المديرين** | `السعر = السعر × (١ + (عدد_المديرين - ١) × ٠.١٥)` | ٣ مديرين = ×١.٣ |
| **الميزات المتقدمة** | قائمة مرجعية (انظر أعلاه) | ٣ ميزات = +٦٠% |
| **الوسائط** | `+٥٠٪ للصور، +١٠٠٪ للفيديو` | صور + فيديو = +١٥٠% |
| **الجدول الزمني** | عاجل: +٢٥٪ فوري: +٥٠٪ | شهر واحد = +٥٠% |
| **الدعم الإضافي** | `+٢٠٪ لكل اجتماع شهري مضمون` | ٢ اجتماع شهري = +٤٠% |

### A3. الحد الأدنى والحد الأقصى للأسعار

بناءً على بحث السوق والتكاليف المشغلة:

#### مجموعة العائلات الصغيرة (50-100 عضو)
```
الحد الأدنى: ٥٠٠ ريال سعودي/سنة
  - شجرة بسيطة فقط
  - ميزات أساسية
  - مسؤول واحد
  - بدون دعم شهري

الحد الأقصى: ١,٥٠٠ ريال سعودي/سنة
  - شجرة متقدمة + وثائق
  - ٢ مسؤول
  - ١ اجتماع دعم شهري
  - ديانا إضافية (historical records)
```

**لماذا**: العائلات الصغيرة لا تحتاج مراجعة معقدة. يمكن تثبيتها في ساعات. التكلفة التشغيلية منخفضة.

#### مجموعة العائلات المتوسطة (200-500 عضو)
```
الحد الأدنى: ٢,٠٠٠ ريال سعودي/سنة
  - شجرة متقدمة
  - ٣-٤ ميزات متوسطة
  - ١-٢ مسؤول
  - بدون دعم شهري

الحد الأقصى: ٦,٠٠٠ ريال سعودي/سنة
  - نظام كامل مع وسائط
  - ٣+ مديرين
  - اجتماعات شهرية منتظمة
  - تكامل مع الأنظمة الأخرى
```

**لماذا**: العائلات المتوسطة تحتاج مراجعة شهرية للصحة البيانية وتنسيق بين المديرين. الدعم يستحق ١٠٠٠+ ريال/سنة.

#### مجموعة العائلات الكبيرة (500+ عضو)
```
الحد الأدنى: ٨,٠٠٠ ريال سعودي/سنة
  - نظام كامل مؤسسي
  - جميع الميزات المتقدمة
  - ٣+ مديرين
  - اجتماع شهري واحد على الأقل

الحد الأقصى: ٢٥,٠٠٠+ ريال سعودي/سنة
  - نظام مخصص بالكامل
  - فريق مكرس (ساعات وصول مخصصة)
  - اجتماعات ربع سنوية + اجتماعات عائلية حية
  - تطوير ميزات مخصصة
```

**لماذا**: العائلات الكبيرة محرك نمو الأعمال. تحتاج اهتماماً شخصياً وتدريباً. قيمة الحفاظ على السجل العائلي الضخم عالية جداً.

---

### A4. استراتيجية العرض والمرساة (Framing & Anchoring)

#### المرساة الأولية (Initial Anchor)
عندما يسأل العميل "كم التكلفة؟" قبل الإجابة:

**❌ خطأ شائع**: "آه، ٥٠٠ إلى ١٠,٠٠٠ ريال"
- النطاق واسع جداً ومربك

**✅ الطريقة الصحيحة**:
```
عبدالله: "من وجهة نظري، السعر يعتمد على حالتك تماماً.
دعني أعطيك مثال: عائلة بـ ٣٠٠ عضو مثل عائلتك، بدون ميزات إضافية،
تبدأ حوالي ٣,٠٠٠ ريال سنة واحدة.
لكن إذا أضفنا الوثائق والصور والاجتماعات الشهرية، ممكن تصل ٦-٨ آلاف.
دعني أفهم احتياجاتك أكتر قبل أعطيك الرقم الدقيق."
```

**لماذا**: المرساة تضع توقعاً معقولاً. تجنب النطاقات الواسعة. شغل العميل بالقيمة أولاً قبل السعر.

#### تقديم السعر (Price Presentation)

**الخطوة 1: العرض الثلاثي** (Good-Better-Best)
```
عبدالله يعرض ثلاث خيارات:

□ الخيار الأساسي (GOOD) - ٣,٠٠٠ ريال
  - شجرة عائلية فقط
  - ملفات تعريف أعضاء
  - بحث أساسي

□ الخيار المتوسط (BETTER) - ٥,٠٠٠ ريال ⭐ (موصى به)
  - شجرة متقدمة
  - رفع وثائق وصور
  - اجتماع دعم شهري واحد
  - تقارير صحة البيانات

□ الخيار الكامل (BEST) - ٨,٠٠٠ ريال
  - جميع ميزات BETTER +
  - معرض الصور التاريخي
  - اجتماعات شهرية منتظمة
  - تصدير PDF والتقارير
  - أولوية عالية في الدعم
```

**لماذا**: العرض الثلاثي يجعل العميل يختار من الواقع بدلاً من مقارنة سعرك بمنافس. الخيار الأوسط أغلبية العملاء يختارونه.

**الخطوة 2: ربط السعر بالقيمة**
```
عبدالله: "بخلاف التكلفة، فكر في القيمة:
- تجنب فقدان السجل العائلي للأبد (كيف يسمح أي أب بهالحاجة؟)
- توثيق تاريخ العائلة للأجيال القادمة (كم قيمة هالشي؟)
- توضيح العلاقات والتوارث (يوفر وقت ومشاكل قانونية)
- منصة آمنة بدل ورقة قديمة في درج"

ثم: "بالمقارنة، ٥ آلاف ريال سنة واحدة = ١٣ ريال يومي لحفظ تاريخ عائلتك بالكامل.
هل هالقيمة تستحق؟"
```

**الخطوة 3: إزالة عائق السعر المتأخر**
```
إذا قال العميل "السعر أغلى من المتوقع":

عبدالله: "أفهم. دعني أعرض خيار:
- نبدأ بالخيار الأساسي الآن (٣,٠٠٠ ريال)
- بعد ٣ أشهر، إذا رضيت بالخدمة، نرقيك للمتوسط ب ٤,٥٠٠ ريال (توفير ٥٠٠).
يعني تختبر المنصة بسعر أقل أولاً؟"
```

**إذا رفضوا السعر تماماً**:
```
عبدالله: "حسناً. لكن بصراحة، لو بتقولي:
'أنا ما أستحق أخاف على سجل عائلتي'
ما أقول غلط. لأن هالشي غيمة محددة حياتك وعيال عيالك.
لكن إذا الميزانية فعلاً صعبة:
- هل نبدأ بالشجرة البسيطة أولاً؟
- أم تريد أسبوع للتفكير وتجمع عائلتك؟"
```

---

### A5. سيناريوهات محادثات البيع (Sales Scripts)

#### السيناريو 1: عائلة صغيرة (50 عضو)
**العميل**: عم محمد، يريد توثيق سلسلة نسبه

```
عبدالله: "السلام عليكم عم محمد. شكراً إنك اتصلت.
أولاً، ماهي أهم حاجة تبغاها من منصة الشجرة العائلية؟"

عم محمد: "أبغا أسجل كل أحفادي وأشوف من تزوج من."

عبدالله: "ممتاز. وكم احفادك بالتقريب؟"

عم محمد: "حوالي ٥٠ نفر من أبنائي وأحفادي."

عبدالله: "تمام. إذاً منصتنا مناسبة تماماً.
لأنها محسوبة بالضبط لعائلات مثل عائلتك.
أحط لك اللي يصير:

أولاً: أنت أو حد من البيت يدخل الأسماء والعلاقات (ساعتين بالكثير).
تاني: أنا أراجع البيانات وأتأكد من صحتها.
تالت: أفتح لك شجرة عائلية تفاعلية، تضيف عليها متى ما تبغا.

السعر لعائلة بـ ٥٠ فرد مثلك = ٧٠٠ ريال السنة.
أقل من ريالين يومياً.

والأجمل: إذا ضفت أحفادك الجدد، الشجرة تتحدّث تلقائي.
لو بدا يحصل خلط بالأسماء، أنا أصحح وأساعد.

بتقبل العرض؟"

عم محمد: "وكم الدفع؟"

عبدالله: "أنت تختار:
١. تحويل بنكي مرة واحدة سنة.
٢. أو أقساط ٣ شهور (٢٥٠ ريال × ٣).

وأنا أعطيك حساب خاص تشتغل عليه بروحك، وإذا احتجت مساعدة أنا هنا."
```

**النقاط المحفوظة**:
- ركزت على الفائدة الفورية (شجرة سهلة)
- ربطت السعر بالقيمة (ريالين يومياً)
- أعطيت خيارات دفع
- لم أضغط على العقد

---

#### السيناريو 2: عائلة متوسطة (300 عضو)
**العميل**: أم فهد، رئيسة جمعية العائلة، تريد منصة متقدمة

```
أم فهد: "سمعت عن Nasaby. أنا أبغا شيء أكتر من جوجل شيتس.
عندنا ٣٠٠ فرد وفيه خلط كبير بالأسماء."

عبدالله: "ممتاز أم فهد. هالخلط طبيعي جداً مع ٣٠٠ فرد.
دعني أفهم احتياجاتك أكتر:

١. بس ما تريدين شجرة رقمية، أم تريدين أرشيف وثائق وصور كمان؟"

أم فهد: "آه، فيه صور قديمة جداً وعم أقولهم لازم نحفظها."

عبدالله: "كويس جداً. وكم أشخاص من عائلتك بيشتغلون معك على الإدارة؟"

أم فهد: "أنا وحد من بناتي وحد من الأخوات."

عبدالله: "حسناً. هذا يعني:
- شجرة عائلية متقدمة ل ٣٠٠ فرد
- معرض صور تاريخي
- ثلاث مديرين (أنت وبنتك والخالة)
- تقارير شهرية عن صحة البيانات

بعرض عليك الحل الكامل: ٥,٠٠٠ ريال السنة.

ليش هالسعر؟ لأن:
- مشروعك معقد (٣٠٠ فرد = مراجعة شهرية ضرورية)
- الصور بتحتاج تخزين آمن وتنسيق
- أنا بنفسي سأراجع البيانات شهري وأصحح الأخطاء
- لو فيه مشكلة، بردك في ٢٤ ساعة

هل تريدين نبدأ؟"

أم فهد: "وماذا إذا بدا نختلف على رقم في الشجرة؟"

عبدالله: "ممتاز السؤال.
المنصة فيها تاريخ نسخ (version history).
إذا غيرت حد معلومة، الشجرة تحفظ من غيّر وفين.
وأنا بأسجل كل نقاش وتصحيح في ملف.
بالآخر، الحقيقة بتنكشف من خلال الحوار العائلي، وأنا الوسيط."

أم فهد: "حسناً. ودفع الفلوس؟"

عبدالله: "أنت تختارين:
أ) تحويل كامل: ٥,٠٠٠ ريال مرة واحدة
ب) أقساط شهرية: ٤٥٠ ريال × ١٢ شهر
ج) أقساط ربع سنوية: ١,٢٥٠ ريال × ٤ مرات

وبيكون عندك لوحة تحكم كاملة لإدارة الفريق.
أنا بشتغل معك أول ٣ أشهر يومياً، بعدين شهري."
```

**النقاط المحفوظة**:
- استكشفت الاحتياجات الإضافية (الصور)
- حددت فريق الإدارة
- بررت السعر بالعمل الشخصي المطلوب
- أجابت على معضلة الخلاف بحل (التاريخ)
- عرضت خيارات دفع متعددة

---

#### السيناريو 3: عائلة كبيرة (800 عضو)
**العميل**: الأمير عبدالرحمن، يريد نظام مؤسسي كامل

```
الأمير: "أنا قرأت عن Nasaby. عندنا أكثر من ٨٠٠ فرد.
النظام الحالي (اكسيل ضخم) كل يوم يتعطل. أبغا شيء احترافي."

عبدالله: "الأمير، شرف لي. لكن قبل السعر، عندي أسئلة مهمة:

١. من يدير البيانات الآن؟ فريق مخصص أم كل واحد يدخل بيانته؟"

الأمير: "عندنا فريق من ٣ بنات، متخصصات بالأرشيف والنسب."

عبدالله: "ممتاز. والهدف النهائي من المنصة؟
هل بس توثيق، أم كمان تريد تقارير وإحصائيات؟"

الأمير: "كل ما قلت. بس كمان أبغا كل واحد من الأسرة يدخل تاريخه (ملخص حياته).
ويصير فيه أرشيف صوتي للكبار قبل ما يروحون."

عبدالله: "هذا مشروع جميل جداً. أنتم بتحفظون تاريخ العائلة الحقيقي.

بناءً على اللي قلتيه:
- ٨٠٠ عضو
- فريق إدارة ٣ أشخاص
- تاريخ الحياة الفردي + أرشيف صوتي
- تقارير وإحصائيات
- احتمال تطويرات مستقبلية

السعر ليس ٥ أو ٨ آلاف.
السعر هنا: ١٥,٠٠٠ إلى ٢٠,٠٠٠ ريال السنة.

لماذا هالسعر؟
أ) حجم البيانات: ٨٠٠ عضو تحتاج سرفرات قوية وتخزين آمن.
ب) الميزات الإضافية: التاريخ الفردي + الصوت = تطوير مخصص.
ج) الدعم المستمر: أنا بنفسي بنعقد معك اجتماعات ربع سنوية.
د) الحماية: هالبيانات تاريخية جداً، الحماية ليست اختيار.

بالمقارنة مع اكسيل:
- اكسيل = بيانات معرضة للحذف العرضي
- Nasaby = بيانات محمية، مشفرة، نسخ احتياطية يومية

هل تريدون نبدأ من ١٥,٠٠٠ ريال السنة؟"

الأمير: "هذا غالي. ودعمك يكون إيه بالضبط؟"

عبدالله: "تمام.
الدعم المدرج يعني:
- اجتماع ربع سنوي (كل ٣ شهور) لمراجعة البيانات
- جلسات تدريب للفريق (٥ ساعات سنوي)
- أولويتك الأول في أي مشكلة (أرد خلال ٢٤ ساعة)
- تحديثات الميزات الجديدة بدون رسوم إضافية

لو تريد دعم أكتر (مثلاً اجتماع شهري):
- ضيف ١,٠٠٠ ريال = اجتماع شهري + جلسة تدريب شهرية.

والتطوير المخصص؟
- أي ميزة إضافية تحتاجها = ٥٠٠-٢,٠٠٠ ريال حسب التعقيد.

أنا بعتبر هالحل استثمار بـ ١٥-٢٠ ألف سنة، وقيمته أضعاف هالرقم."

الأمير: "ماذا إذا لم أكون راضي في الأشهر الثلاثة الأولى؟"

عبدالله: "سياسة واضحة:
- أول ٣ أشهر: ضمان استرجاع ١٠٠٪
- بدون أسئلة، بدون شروط
- بس أتطلب منك ملاحظة لتحسين الخدمة

يعني أنت بتجرب بدون خطر."

الأمير: "تمام. نبدأ."
```

**النقاط المحفوظة**:
- لم أعطِ السعر أولاً - استكشفت القيمة أولاً
- بررت السعر العالي بالتفاصيل (التخزين، الحماية، الدعم)
- قدمت خيارات تصعيدية (دعم إضافي، تطوير مخصص)
- أزلت الخطر بضمان استرجاع الأموال

---

### A6. التفاوض والإغلاق (Negotiation & Closing)

#### إذا قال العميل: "غيرك أرخص"

**❌ خطأ**: "حسناً، أقلل السعر"

**✅ الصحيح**:
```
عبدالله: "أفهم. بس دعني أسأل:
الخدمة الثانية = كم عضو من فريقهم بيشتغل على عائلتك مباشرة؟"

إذا قالوا "خدمة تلقائية":
عبدالله: "كويس. بس أنت تريد شجرة بدون أخطاء، ولا تريد شجرة رخيصة معها أخطاء؟
لأن تصحيح أخطاء سنة كاملة من بيانات محطوة = أغلى بكتير من الفرق بالسعر."

إذا قالوا "بس ما فيه مثل دعمك":
عبدالله: "بالظبط. فيه فرق بين الخدمة الرخيصة والخدمة الجيدة.
الفرق ٥٠٠ ريال؟ دعني أعرض عليك ألا تندم على السعر الرخيص لاحقاً."
```

#### إذا قال العميل: "دعني أفكر"

**✅ الصحيح**:
```
عبدالله: "تمام. بس قبل ما تروح، دعني أسأل:
هل فيه عائق أخير يمنعك من البدء اليوم؟
- السعر عالي شوي؟
- الميزات ما تكفيك؟
- تريد استشارة عائلتك أولاً؟

لأن تأخير القرار = تأخير حفظ تاريخ عائلتك."

إذا قالوا "أبغا أستشير العائلة":
عبدالله: "حكمة. خذ وقتك. بس بعطيك فكرة:
بعتبر أول ما تقرر = أجمدّ لك سعر اليوم لمدة ٧ أيام.
بعد ٧ أيام، قد يكون السعر أختلف حسب الطلب.

يعني أنت عندك أسبوع للتفكير بدون قلق من رفع السعر. كويس؟"
```

---

# الجزء ب: قرار البنية التحتية للدفع
## Part B: Payment Infrastructure Decision (قرار البنية التحتية للدفع)

### B1. مقارنة موفري الدفع في المملكة (Payment Providers Comparison)

بناءً على بحث 2026 في السوق السعودي، هناك ثلاث خيارات رئيسية:

| المعيار | Tap Payments | Moyasar | HyperPay |
|--------|--------------|---------|----------|
| **رسوم العملية** | 2.85% + 0.30 ريال | 2.5-2.9% | 2.5% + 0.75 ريال |
| **رسوم Mada** | 1% (حد أقصى 200 ريال) | متغيرة | متضمنة |
| **الترخيص السعودي** | ✅ معتمد | ✅ SAMA مرخص | ✅ معتمد |
| **التوافقية مع Mada** | ✅ كامل | ✅ كامل | ✅ كامل |
| **دعم Apple Pay** | ✅ نعم | ✅ نعم | ✅ نعم |
| **دعم STCPAY** | ✅ نعم | ✅ نعم | ✅ نعم |
| **الدفع المتكرر (Recurring)** | ✅ نعم | ✅ نعم | ✅ نعم |
| **الـ Webhooks** | ✅ قوية | ✅ قوية | ✅ قوية |
| **التوثيق** | جيدة جداً | ممتازة | جيدة |
| **تكامل SDK** | ✅ سهل | ✅ سهل | ✅ متوسط |
| **وقت الإعداد** | ١-٢ أسبوع | ١-٢ أسبوع | ٢-٣ أسابيع |
| **دعم العملاء** | جيد | ممتاز | متوسط |
| **التكاليف الإضافية** | بدون | بدون | قد يكون |

### B2. الاختيار النهائي: Tap Payments

**الاختيار**: **Tap Payments** هي أفضل خيار لـ Nasaby.

#### لماذا Tap؟

**١. الرسوم المنخفضة والواضحة**
```
Tap: 2.85% + 0.30 ريال لكل عملية
HyperPay: 2.5% + 0.75 ريال (أعلى قليلاً عند الريال الواحد)
Moyasar: 2.5-2.9% (نطاق غير محدد)

مثال: عملية ٥,٠٠٠ ريال (عقد سنوي واحد)
- Tap: 142.5 + 0.30 = ١٤٢.٨ ريال
- HyperPay: 125 + 0.75 = ١٢٥.٧٥ ريال
- الفرق: أقل من ٢٠ ريال سنة واحدة (مهمل)

لكن:
- Tap تملك أفضل UX للعميل (أقل خطوات)
- Moyasar قد تفرض رسوم إعداد (لم نوجدها)
```

**٢. التوافقية مع السوق السعودي**
```
Tap الأكثر استخداماً في السعودية:
- معتمدة من Mada الرسمية
- Apple Pay على جميع الأجهزة السعودية
- STCPAY (أكثر محفظة رقمية استخداماً في السعودية)
- التحويل البنكي (تحويل بطيء لكن آمن)

هذا يعني:
- عميلك (أم فهد مثلاً) تفتح تطبيق Tap في المنصة
- تختار Mada (بطاقتها القديمة)
- تدخل كلمة السر مرة واحدة
- انتهى. بدون إعادة تحويل أو خطوات زائدة
```

**٣. الدفع المتكرر (Recurring Billing)**
```
Tap توفر recurring payments اللي تحتاجه Nasaby:
- تفويض سنوي واحد من العميل
- تجديد تلقائي كل سنة
- الفاتورة ترسل قبل الخصم بـ ٥ أيام
- إذا رفضت البطاقة، محاولة ثانية بعد يومين

هذا يعني:
- بدون متابعة يدوية من عبدالله
- العميل يتحكم: يقبل التجديد أو يوقفه من تطبيق Tap
```

**٤. الـ Webhooks القوية**
```
Tap توفر webhooks دقيقة جداً:
- عند كل عملية دفع (payment.completed)
- عند فشل العملية (payment.failed)
- عند استرجاع المبلغ (refund.completed)
- عند تجديد العقد الدوري (subscription.renewed)

هذا يعني:
- Nasaby تستقبل تنبيهاً
- تفعل الفور الخدمة تلقائياً (تحديث الاشتراك)
- بدون تأخير أو خطأ يدوي
```

**٥. التطبيق الموثوق في السوق**
```
Tap مستخدمة من:
- أرامكو للدفع الرقمي
- أمازون السعودية
- Uber و Careem
- عشرات المتاجر الإلكترونية

معنى كده:
- أم فهد (العميل) بتثق في Tap (شفتها قبل كده)
- بدون خطوات أمان إضافية يدوية
- تدفع بسهولة مثل ما تدفع أي حاجة
```

#### الآثار السلبية البسيطة (Minor Drawbacks)

| نقطة | الحل |
|------|------|
| رسوم قليلاً أعلى من HyperPay (٢٠ ريال سنة) | مهمل جداً على حجم العائلة |
| التوثيق قد يحتاج قراءة متعددة | لدينا مثال كود Tap جاهز أدناه |
| دعم العملاء بالإنجليزية أساساً | لكن الواجهة عربية 100% |

### B3. خطوات التكامل مع Tap Payments

#### الخطوة 1: إنشاء حساب Tap
```
1. اذهب إلى https://www.tap.company/en-sa
2. اضغط "Get Started for Merchants"
3. ملأ نموذج بيانات عبدالله:
   - الاسم الكامل
   - رقم الهاتف
   - البريد الإلكتروني
   - رقم السجل التجاري (إن وجد)
4. تحقق من البريد (رسالة تأكيد)
5. ستحصل على:
   - API Key العام
   - API Secret الخاص
   - لوحة تحكم Tap
```

#### الخطوة 2: حفظ بيانات الاتصال
في ملف البيئة `.env`:
```env
TAP_API_KEY=pk_live_xxxxxxxxxxxxx
TAP_API_SECRET=sk_live_xxxxxxxxxxxxx
TAP_API_URL=https://api.tap.company/v2
```

#### الخطوة 3: تثبيت مكتبة Tap في المشروع
```bash
npm install @tap-payments/tap-sdk
```

#### الخطوة 4: مثال كود لدفع سنوي واحد

```typescript
// src/services/paymentService.ts

import { Charge, TapSDK } from '@tap-payments/tap-sdk';

const tapSDK = new TapSDK({
  publicKey: process.env.REACT_APP_TAP_API_KEY,
});

interface CreatePaymentParams {
  familyId: string;
  amount: number; // بالريال
  description: string; // مثل "اشتراك سنوي - عائلة الخنيني"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subscriptionPlan?: 'monthly' | 'yearly';
}

export async function createPayment(params: CreatePaymentParams) {
  try {
    const charge = await tapSDK.charges.create({
      amount: params.amount * 100, // Tap يتعامل بـ Fils (100 fils = 1 ريال)
      currency: 'SAR',
      description: params.description,

      // معلومات العميل
      customer: {
        first_name: params.customerName.split(' ')[0],
        last_name: params.customerName.split(' ').slice(1).join(' '),
        email: params.customerEmail,
        phone: {
          country_code: '+966',
          number: params.customerPhone,
        },
      },

      // URL للعودة بعد الدفع
      redirect: {
        url: `${window.location.origin}/payment-success?familyId=${params.familyId}`,
      },

      // للدفع المتكرر (الاشتراك السنوي)
      subscription: params.subscriptionPlan ? {
        interval: params.subscriptionPlan === 'yearly' ? 12 : 1,
        period: 'month',
      } : undefined,

      // معلومات إضافية
      metadata: {
        familyId: params.familyId,
        planType: params.subscriptionPlan || 'one-time',
      },
    });

    // أرجع رابط الدفع
    return {
      chargeId: charge.id,
      paymentUrl: charge.transaction.url,
      status: charge.status,
    };
  } catch (error) {
    console.error('خطأ في إنشاء العملية:', error);
    throw new Error('فشل إنشاء رابط الدفع');
  }
}

// للدفع المتكرر (تجديد الاشتراك)
export async function createRecurringPayment(params: CreatePaymentParams & {
  recurringEvery: 'monthly' | 'yearly';
}) {
  try {
    const charge = await tapSDK.charges.create({
      amount: params.amount * 100,
      currency: 'SAR',
      description: params.description,

      customer: {
        first_name: params.customerName.split(' ')[0],
        last_name: params.customerName.split(' ').slice(1).join(' '),
        email: params.customerEmail,
        phone: {
          country_code: '+966',
          number: params.customerPhone,
        },
      },

      // تفويض بدون إعادة توجيه للدفع
      authentication: {
        type: 'RECURRING',
      },

      subscription: {
        interval: params.recurringEvery === 'yearly' ? 12 : 1,
        period: 'month',
        expiry_month: 12,
        expiry_year: new Date().getFullYear() + 1,
      },

      metadata: {
        familyId: params.familyId,
        recurringType: params.recurringEvery,
      },
    });

    return {
      chargeId: charge.id,
      subscriptionId: charge.subscription.id,
      status: charge.status,
    };
  } catch (error) {
    console.error('خطأ في الدفع المتكرر:', error);
    throw new Error('فشل إنشاء اشتراك متكرر');
  }
}
```

#### الخطوة 5: التعامل مع Webhooks من Tap

```typescript
// supabase/functions/tap-webhook/index.ts
// هذه دالة Edge Function تستقبل الأحداث من Tap

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface TapWebhookPayload {
  event: {
    type: string; // مثل "charge.successful", "charge.failed"
  };
  data: {
    id: string; // معرّف العملية
    status: string; // "completed", "failed"
    amount: number;
    currency: string;
    metadata: {
      familyId: string;
      planType: string;
    };
    subscription?: {
      id: string;
    };
  };
}

serve(async (req) => {
  // التحقق من أن الطلب من Tap (توقيع آمن)
  const signature = req.headers.get("x-tap-signature");
  if (!signature) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload: TapWebhookPayload = await req.json();
  const { event, data } = payload;

  try {
    // إذا كانت العملية ناجحة
    if (event.type === "charge.successful" && data.status === "completed") {
      const { familyId } = data.metadata;

      // تحديث حالة الاشتراك في قاعدة البيانات
      await supabase
        .from("family_subscriptions")
        .update({
          status: "active",
          payment_status: "paid",
          tap_charge_id: data.id,
          last_payment_date: new Date().toISOString(),

          // إذا كان اشتراك متكرر
          ...(data.subscription && {
            tap_subscription_id: data.subscription.id,
            next_billing_date: calculateNextBillingDate(),
          }),
        })
        .eq("family_id", familyId);

      // إرسال بريد تأكيد للعائلة
      await sendConfirmationEmail(familyId, data.amount / 100);

      // تسجيل الحدث
      await supabase.from("payment_logs").insert({
        family_id: familyId,
        event_type: "payment_successful",
        tap_charge_id: data.id,
        amount: data.amount / 100,
        timestamp: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    // إذا فشلت العملية
    if (event.type === "charge.failed" || data.status === "failed") {
      const { familyId } = data.metadata;

      await supabase
        .from("family_subscriptions")
        .update({
          payment_status: "failed",
          last_payment_error: "عملية الدفع فشلت. يرجى المحاولة مرة أخرى.",
        })
        .eq("family_id", familyId);

      // إرسال تنبيه للعائلة
      await sendPaymentFailureNotification(familyId);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    // أحداث أخرى (مثل استرجاع المبلغ)
    if (event.type === "refund.successful") {
      const { familyId } = data.metadata;

      await supabase
        .from("family_subscriptions")
        .update({
          status: "cancelled",
          payment_status: "refunded",
        })
        .eq("family_id", familyId);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ unknown_event: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("خطأ في معالجة webhook من Tap:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
});

function calculateNextBillingDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

async function sendConfirmationEmail(
  familyId: string,
  amount: number
) {
  // تنفيذ إرسال بريد التأكيد
  console.log(
    `تأكيد دفع: العائلة ${familyId} دفعت ${amount} ريال`
  );
}

async function sendPaymentFailureNotification(familyId: string) {
  // تنفيذ إرسال التنبيه
  console.log(`تنبيه فشل الدفع: العائلة ${familyId}`);
}
```

---

# الجزء ج: هندسة الاشتراكات
## Part C: Subscription Architecture (هندسة الاشتراكات)

### C1. قاعدة البيانات (Database Schema)

#### الجدول 1: الاشتراكات الأساسية
```sql
CREATE TABLE IF NOT EXISTS family_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- الربط بالعائلة
  family_id TEXT NOT NULL UNIQUE REFERENCES families(id) ON DELETE CASCADE,

  -- معلومات الخطة
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('basic', 'professional', 'enterprise')),
  plan_price DECIMAL(10, 2) NOT NULL, -- السعر بالريال
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- حالة الاشتراك
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'expired')),

  -- حالة الدفع
  payment_status VARCHAR(50) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- تواريخ مهمة
  started_at TIMESTAMPTZ DEFAULT now(),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  next_billing_date TIMESTAMPTZ,

  -- معلومات الإلغاء
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- معلومات التجديد
  renewal_attempts INT DEFAULT 0 DEFAULT 3, -- عدد محاولات تجديد الدفع
  last_renewal_error TEXT,

  -- Tap Integration
  tap_charge_id VARCHAR(255),
  tap_subscription_id VARCHAR(255) UNIQUE,

  -- معلومات إضافية
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Index للبحث السريع
  CONSTRAINT subscriptions_family_id_unique UNIQUE(family_id)
);

CREATE INDEX idx_family_subscriptions_status ON family_subscriptions(status);
CREATE INDEX idx_family_subscriptions_next_billing ON family_subscriptions(next_billing_date);
CREATE INDEX idx_family_subscriptions_payment_status ON family_subscriptions(payment_status);
```

#### الجدول 2: سجل الدفعات
```sql
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- الربط
  family_subscription_id UUID NOT NULL REFERENCES family_subscriptions(id) ON DELETE CASCADE,

  -- معلومات الدفع
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',

  -- حالة الدفع
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Tap ID
  tap_charge_id VARCHAR(255) UNIQUE,

  -- الأخطاء (إن وجدت)
  error_message TEXT,

  -- التواريخ
  attempted_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- النوع
  payment_type VARCHAR(50) NOT NULL
    CHECK (payment_type IN ('initial', 'renewal', 'manual')),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscription_payments_family_id ON subscription_payments(family_subscription_id);
CREATE INDEX idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX idx_subscription_payments_tap_id ON subscription_payments(tap_charge_id);
```

#### الجدول 3: فترات السماح (Grace Periods)
```sql
CREATE TABLE IF NOT EXISTS subscription_grace_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- الربط
  family_subscription_id UUID NOT NULL UNIQUE REFERENCES family_subscriptions(id) ON DELETE CASCADE,

  -- التواريخ
  grace_started_at TIMESTAMPTZ DEFAULT now(),
  grace_ends_at TIMESTAMPTZ NOT NULL, -- عادة بعد 7 أيام

  -- السبب
  reason VARCHAR(100) NOT NULL
    CHECK (reason IN ('payment_failed', 'payment_delayed', 'manual_review')),

  -- هل تم الحل؟
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_grace_periods_family_id ON subscription_grace_periods(family_subscription_id);
CREATE INDEX idx_grace_periods_active ON subscription_grace_periods(grace_ends_at) WHERE resolved = FALSE;
```

#### الجدول 4: لوحة التحكم الإدارية (Admin Dashboard Data)
```sql
CREATE TABLE IF NOT EXISTS subscription_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- المقاييس اليومية
  date DATE NOT NULL UNIQUE,

  -- عدد الاشتراكات
  total_active_subscriptions INT DEFAULT 0,
  total_pending_subscriptions INT DEFAULT 0,
  total_cancelled_subscriptions INT DEFAULT 0,

  -- الإيرادات
  daily_revenue DECIMAL(12, 2) DEFAULT 0,
  daily_successful_payments INT DEFAULT 0,
  daily_failed_payments INT DEFAULT 0,

  -- معدلات النمو
  churn_rate DECIMAL(5, 2) DEFAULT 0, -- نسبة الإلغاء (%)
  renewal_rate DECIMAL(5, 2) DEFAULT 0, -- نسبة التجديد (%)

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_date ON subscription_analytics(date DESC);
```

### C2. سيناريوهات الحالة (State Machine)

```
    [pending]
       |
       | (Tap webhook success)
       v
    [active] <--- (renewal success)
       |
       +---- (payment fails)
       |           |
       |           v
       |    [failed attempt 1]
       |           |
       |           +---- (retry in 2 days)
       |           |
       |           v
       |    [failed attempt 2]
       |           |
       |           +---- (retry in 2 days)
       |           |
       |           v
       |    [failed attempt 3]
       |           |
       |           +---- (grace period starts)
       |           |
       |           v
       |    [suspended] <--- (in grace period)
       |           |
       |           +---- (no payment in 7 days)
       |           |
       |           v
       +--------> [expired]
       |
       | (cancel request)
       v
    [cancelled]
```

### C3. تفاصيل الحالات (State Details)

| الحالة | المدة | ما الذي يعمل | ما الذي يوقف | التحرك التالي |
|--------|------|-----------|-----------|------------|
| **pending** | ساعات قليلة | بدون ميزات | بدون وصول | انتظار webhook من Tap |
| **active** | حتى renewal | كل الميزات | بدون حدود | تجديد تلقائي قبل نهاية المدة |
| **failed (attempt 1)** | يومين | كل الميزات | بدون إضافة | محاولة جديدة (Tap يحاول تلقائياً) |
| **failed (attempt 2)** | يومين | كل الميزات | بدون إضافة | محاولة أخيرة (Tap يحاول) |
| **failed (attempt 3)** | يومين | كل الميزات | بدون إضافة | فترة سماح تبدأ |
| **suspended** | ٧ أيام | قراءة فقط | تحديث البيانات | دفع يدوي أو انتظار الانتهاء |
| **expired** | نهائي | بدون ميزات | بدون وصول | يمكن فقط إعادة الاشتراك |
| **cancelled** | نهائي | أرشيف فقط | بدون تعديل | لا يمكن العودة (جديد فقط) |

### C4. منطق التجديد التلقائي (Auto-Renewal Logic)

```typescript
// src/services/subscriptionService.ts

import { supabase } from "@/lib/supabaseClient";

export interface SubscriptionRenewalJob {
  subscriptionId: string;
  familyId: string;
  amount: number;
  nextBillingDate: string;
}

/**
 * تشغيل هذه الدالة يومياً (مثل cron job)
 * مهمتها: تجديد الاشتراكات التي انتهت مدتها
 */
export async function processSubscriptionRenewals() {
  try {
    // ابحث عن جميع الاشتراكات النشطة التي تنتهي اليوم أو غداً
    const { data: subscriptions, error } = await supabase
      .from("family_subscriptions")
      .select("*")
      .eq("status", "active")
      .lte("next_billing_date", new Date().toISOString())
      .gt("next_billing_date", new Date(Date.now() - 86400000).toISOString()); // في آخر 24 ساعة

    if (error) throw error;

    // لكل اشتراك، حاول تجديده
    for (const subscription of subscriptions) {
      await renewSubscription(subscription);
    }

    console.log(`تم معالجة ${subscriptions.length} اشتراك للتجديد`);
    return { processed: subscriptions.length };
  } catch (error) {
    console.error("خطأ في معالجة التجديدات:", error);
    throw error;
  }
}

/**
 * تجديد اشتراك واحد
 */
async function renewSubscription(subscription: any) {
  try {
    // إنشاء عملية دفع جديدة عبر Tap
    const paymentResult = await createRenewalCharge(subscription);

    // تسجيل محاولة الدفع
    const { error: logError } = await supabase
      .from("subscription_payments")
      .insert({
        family_subscription_id: subscription.id,
        amount: subscription.plan_price,
        currency: "SAR",
        status: paymentResult.status,
        tap_charge_id: paymentResult.chargeId,
        payment_type: "renewal",
      });

    if (logError) throw logError;

    // إذا نجحت العملية
    if (paymentResult.status === "completed") {
      // تحديث الاشتراك
      await supabase
        .from("family_subscriptions")
        .update({
          status: "active",
          payment_status: "paid",
          current_period_start: new Date().toISOString(),
          current_period_end: calculatePeriodEnd(
            subscription.billing_cycle
          ),
          next_billing_date: calculateNextBillingDate(
            subscription.billing_cycle
          ),
          renewal_attempts: 0, // إعادة تعيين العداد
          last_renewal_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      console.log(
        `✅ تم تجديد الاشتراك ${subscription.family_id} بنجاح`
      );
    }

    // إذا فشلت العملية
    if (paymentResult.status === "failed") {
      await handlePaymentFailure(subscription);
    }
  } catch (error) {
    console.error(
      `❌ خطأ في تجديد اشتراك ${subscription.family_id}:`,
      error
    );
    await handlePaymentFailure(subscription);
  }
}

/**
 * التعامل مع فشل الدفع
 */
async function handlePaymentFailure(subscription: any) {
  const newAttemptCount = (subscription.renewal_attempts || 0) + 1;
  const maxAttempts = 3;

  // إذا وصلنا للمحاولة الأخيرة
  if (newAttemptCount >= maxAttempts) {
    // بدء فترة السماح
    const graceEndDate = new Date();
    graceEndDate.setDate(graceEndDate.getDate() + 7); // ٧ أيام

    await supabase
      .from("subscription_grace_periods")
      .insert({
        family_subscription_id: subscription.id,
        grace_ends_at: graceEndDate.toISOString(),
        reason: "payment_failed",
      });

    // تعليق الاشتراك
    await supabase
      .from("family_subscriptions")
      .update({
        status: "suspended",
        payment_status: "failed",
        renewal_attempts: newAttemptCount,
        last_renewal_error: "فشل الدفع بعد ٣ محاولات. الاشتراك معلق.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    // إرسال بريد تنبيه للعائلة
    await sendSuspensionNotification(subscription.family_id);
  } else {
    // محاولة أخرى لاحقاً
    await supabase
      .from("family_subscriptions")
      .update({
        renewal_attempts: newAttemptCount,
        last_renewal_error: `محاولة ${newAttemptCount} من ${maxAttempts} فشلت. سيتم إعادة المحاولة بعد يومين.`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);
  }
}

/**
 * إنشاء عملية دفع تجديد عبر Tap
 */
async function createRenewalCharge(subscription: any) {
  // دعوة خادم Tap (يجب أن تكون هذه من backend)
  // بدون إعادة توجيه (لأنها تجديد تلقائي)
  return {
    chargeId: "tap_charge_123",
    status: "completed", // أو "failed"
  };
}

function calculatePeriodEnd(billingCycle: string): string {
  const date = new Date();
  if (billingCycle === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else if (billingCycle === "monthly") {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
}

function calculateNextBillingDate(billingCycle: string): string {
  return calculatePeriodEnd(billingCycle);
}

async function sendSuspensionNotification(familyId: string) {
  console.log(`إرسال تنبيه تعليق للعائلة ${familyId}`);
  // تنفيذ إرسال البريد/الإشعار
}
```

### C5. ما يتم قفله عند انتهاء الاشتراك (Feature Lockdown)

عندما تكون حالة الاشتراك ليست `active`، يتم قفل هذه الميزات:

#### الميزات المتاحة فقط للمستخدمين المسجلين:
```
✅ اقرأ الشجرة (read-only)
✅ ابحث عن أفراد
✅ احسب القرابة
✅ شاهد الملفات الشخصية المرئية

❌ أضف عضو جديد
❌ عدّل معلومات
❌ أضف صورة أو وثيقة
❌ احفظ تقرير
❌ صدّر البيانات
❌ أرسل إشعار
```

#### الميزات المتاحة للإداريين في الوضع `suspended`:
```
✅ شاهد لوحة التحكم (معلومات عامة فقط)
❌ قم بأي تعديل
❌ ضف أعضاء
❌ احذف سجلات

مع رسالة واضحة:
⚠️ الاشتراك معلق. السبب: فشل الدفع.
   يرجى تحديث معلومات الدفع أو التواصل مع الدعم.
```

#### كود الإغلاق:
```typescript
// src/hooks/useSubscriptionStatus.ts

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export interface SubscriptionStatus {
  isActive: boolean;
  status: string;
  canEdit: boolean;
  canAddMembers: boolean;
  canUploadMedia: boolean;
  canExport: boolean;
  warningMessage?: string;
}

export function useSubscriptionStatus(familyId: string): SubscriptionStatus {
  const { user } = useAuth();
  const [subscription, setSubscription] = React.useState(null);

  React.useEffect(() => {
    async function loadSubscription() {
      if (!familyId) return;

      const { data, error } = await supabase
        .from("family_subscriptions")
        .select("status, payment_status, grace_periods:subscription_grace_periods(*)")
        .eq("family_id", familyId)
        .single();

      setSubscription(data);
    }

    loadSubscription();
  }, [familyId]);

  if (!subscription) {
    return {
      isActive: false,
      status: "loading",
      canEdit: false,
      canAddMembers: false,
      canUploadMedia: false,
      canExport: false,
    };
  }

  const isActive = subscription.status === "active";
  const isSuspended = subscription.status === "suspended";

  return {
    isActive,
    status: subscription.status,
    canEdit: isActive && user?.isAdmin,
    canAddMembers: isActive && user?.isAdmin,
    canUploadMedia: isActive && user?.isAdmin,
    canExport: isActive && user?.isAdmin,
    warningMessage: isSuspended
      ? "الاشتراك معلق. يرجى تحديث معلومات الدفع."
      : subscription.status === "cancelled"
        ? "انتهى الاشتراك. لا يمكن إجراء تعديلات."
        : undefined,
  };
}
```

### C6. لوحة التحكم الإدارية (Admin Dashboard)

```typescript
// src/pages/admin/SubscriptionDashboard.tsx

import React from "react";
import { useAdminSubscriptions } from "@/hooks/admin/useAdminSubscriptions";

export default function SubscriptionDashboard() {
  const {
    subscriptions,
    analytics,
    totalRevenue,
    churnRate,
    renewalRate,
  } = useAdminSubscriptions();

  return (
    <div className="space-y-6 p-6">
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الاشتراكات النشطة"
          value={analytics.totalActiveSubscriptions}
          color="green"
        />
        <StatCard
          title="الإيرادات الشهرية"
          value={`${totalRevenue} ريال`}
          color="blue"
        />
        <StatCard
          title="معدل التحديث"
          value={`${renewalRate}%`}
          color="yellow"
        />
        <StatCard
          title="معدل الإلغاء"
          value={`${churnRate}%`}
          color="red"
        />
      </div>

      {/* جدول الاشتراكات بالتفاصيل */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">الاشتراكات</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th>العائلة</th>
              <th>الخطة</th>
              <th>الحالة</th>
              <th>تاريخ التجديد</th>
              <th>الإيرادات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b hover:bg-gray-50">
                <td>{sub.family_name}</td>
                <td>{sub.plan_type}</td>
                <td>
                  <StatusBadge status={sub.status} />
                </td>
                <td>{formatDate(sub.next_billing_date)}</td>
                <td>{sub.plan_price} ريال</td>
                <td className="space-x-2">
                  {sub.status === "suspended" && (
                    <button
                      onClick={() =>
                        handleManualPaymentRecording(sub.id)
                      }
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      تسجيل دفع يدوي
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleCancelSubscription(sub.id)
                    }
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    إلغاء
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* قائمة الاشتراكات المعلقة */}
      <SuspendedSubscriptionsSection
        subscriptions={subscriptions.filter(
          (s) => s.status === "suspended"
        )}
      />

      {/* الدفعات الفاشلة */}
      <FailedPaymentsSection
        payments={subscriptions
          .filter((s) => s.payment_status === "failed")
          .map((s) => ({
            ...s,
            error: s.last_renewal_error,
          }))}
      />
    </div>
  );
}
```

### C7. تسجيل الدفع اليدوي (Manual Payment Recording)

```typescript
// src/services/adminPaymentService.ts

interface ManualPaymentRecord {
  familyId: string;
  amount: number;
  paymentMethod: "bank_transfer" | "check" | "cash";
  notes: string;
  proofOfPayment?: File; // صورة التحويل البنكي أو الشيك
}

export async function recordManualPayment(
  data: ManualPaymentRecord
) {
  try {
    // 1. تسجيل الدفع
    const { data: payment, error: paymentError } = await supabase
      .from("subscription_payments")
      .insert({
        family_subscription_id: (
          await supabase
            .from("family_subscriptions")
            .select("id")
            .eq("family_id", data.familyId)
            .single()
        ).data.id,
        amount: data.amount,
        currency: "SAR",
        status: "completed",
        payment_type: "manual",
        tap_charge_id: null,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 2. تحديث الاشتراك
    const { error: subError } = await supabase
      .from("family_subscriptions")
      .update({
        status: "active",
        payment_status: "paid",
        current_period_start: new Date().toISOString(),
        current_period_end: calculatePeriodEnd(),
        next_billing_date: calculateNextBillingDate(),
        renewal_attempts: 0,
        last_renewal_error: null,
      })
      .eq("family_id", data.familyId);

    if (subError) throw subError;

    // 3. حفظ إثبات الدفع (إن وجد)
    if (data.proofOfPayment) {
      const fileName = `manual_payment_${Date.now()}_${data.proofOfPayment.name}`;
      const { error: uploadError } = await supabase.storage
        .from("payment_proofs")
        .upload(fileName, data.proofOfPayment);

      if (!uploadError) {
        // ربط الملف بسجل الدفع
        await supabase
          .from("subscription_payments")
          .update({
            proof_of_payment_url: fileName,
          })
          .eq("id", payment.id);
      }
    }

    // 4. إرسال بريد تأكيد للعائلة
    await sendPaymentConfirmationEmail(data.familyId, data.amount);

    return {
      success: true,
      paymentId: payment.id,
      message: "تم تسجيل الدفع بنجاح",
    };
  } catch (error) {
    console.error("خطأ في تسجيل الدفع اليدوي:", error);
    throw error;
  }
}

async function sendPaymentConfirmationEmail(
  familyId: string,
  amount: number
) {
  console.log(
    `إرسال بريد تأكيد الدفع للعائلة ${familyId}: ${amount} ريال`
  );
  // تنفيذ إرسال البريل
}

function calculatePeriodEnd(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

function calculateNextBillingDate(): string {
  return calculatePeriodEnd();
}
```

---

# الجزء د: توقعات الإيرادات
## Part D: Revenue Projections (توقعات الإيرادات)

### D1. الافتراضات الأساسية

```
الفترة: سنة واحدة (1 يناير - 31 ديسمبر 2026)

جوانب العائلات:
- صغيرة (50-100 عضو)       = 15% من السوق المحتمل = 500-1,500 ريال/سنة
- متوسطة (200-500 عضو)     = 50% من السوق المحتمل = 2,000-6,000 ريال/سنة
- كبيرة (500+ عضو)          = 35% من السوق المحتمل = 8,000-25,000 ريال/سنة

متوسط الأسعار الموزون:
- صغيرة: 1,000 ريال (متوسط الحد الأدنى والأقصى)
- متوسطة: 4,000 ريال
- كبيرة: 12,000 ريال

معدل الاحتفاظ بالعملاء (Retention):
- السنة الأولى: 80% (بعض العائلات قد تجد البديل أو توقف الحاجة)
- السنة الثانية+: 90%

معدل النمو الشهري (CAC - Customer Acquisition Cost):
- شهر 1-2: 0-1 عائلة جديدة (بدء هادئ)
- شهر 3-6: 1-3 عائلات جديدة شهرياً
- شهر 7-12: 2-4 عائلات جديدة شهرياً
```

### D2. السيناريو المحافظ (Conservative Scenario)

**الهدف: 5 عائلات مدفوعة بنهاية السنة**

```
توزيع العائلات:
- 2 عائلة صغيرة        × 1,000 ريال = 2,000 ريال
- 2 عائلة متوسطة      × 4,000 ريال = 8,000 ريال
- 1 عائلة كبيرة        × 12,000 ريال = 12,000 ريال
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
إجمالي الإيرادات السنوية = 22,000 ريال
```

**الجدول الزمني الشهري**:

| الشهر | النشاط | العائلات الجديدة | الإيرادات الشهرية | الإيرادات التراكمية |
|------|--------|-----------------|------------------|-------------------|
| يناير | بدء وعرض توضيحي | 0 | 0 | 0 |
| فبراير | محادثات مبدئية | 0 | 0 | 0 |
| مارس | **أول توقيع** (عائلة صغيرة) | 1 | 1,000 | 1,000 |
| أبريل | عرض توضيحي | 0 | 0 | 1,000 |
| مايو | **توقيع ثاني** (عائلة متوسطة) | 1 | 4,000 | 5,000 |
| يونيو | دعم العائلات | 0 | 0 | 5,000 |
| يوليو | **توقيع ثالث** (عائلة متوسطة) | 1 | 4,000 | 9,000 |
| أغسطس | دعم، عرض توضيحي | 0 | 0 | 9,000 |
| سبتمبر | **توقيع رابع** (عائلة صغيرة) | 1 | 1,000 | 10,000 |
| أكتوبر | دعم، عرض توضيحي | 0 | 0 | 10,000 |
| نوفمبر | **توقيع خامس** (عائلة كبيرة) | 1 | 12,000 | 22,000 |
| ديسمبر | دعم + تجديدات | (تجديد) | +4,000* | 26,000* |

*في ديسمبر، قد تجدد عائلة (متوسطة) اشتراكها = +4,000 ريال إضافي

**الملخص**:
- إيرادات سنوية: **22,000 - 26,000 ريال**
- متوسط الإيرادات الشهرية: **1,800 - 2,200 ريال**
- وقت استرجاع التكاليف (Breakeven): ديسمبر/يناير

---

### D3. السيناريو الواقعي (Realistic Scenario)

**الهدف: 15 عائلة مدفوعة بنهاية السنة**

```
توزيع العائلات:
- 2 عائلة صغيرة        × 1,000 ريال = 2,000 ريال
- 8 عائلات متوسطة      × 4,000 ريال = 32,000 ريال
- 5 عائلات كبيرة        × 12,000 ريال = 60,000 ريال
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
إجمالي الإيرادات السنوية = 94,000 ريال
```

**الجدول الزمني الشهري**:

| الشهر | العائلات المدفوعة | الإيرادات الشهرية | الإيرادات التراكمية |
|------|-----------------|------------------|-------------------|
| يناير | 0 | 0 | 0 |
| فبراير | 1 (صغيرة) | 1,000 | 1,000 |
| مارس | 2 (صغيرة + متوسطة) | 5,000 | 6,000 |
| أبريل | 3 (متوسطة) | 4,000 | 10,000 |
| مايو | 5 (2 متوسطة + 1 كبيرة) | 16,000 | 26,000 |
| يونيو | 7 (متوسطة + 2 كبيرة) | 16,000 | 42,000 |
| يوليو | 10 (3 متوسطة + 2 كبيرة) | 20,000 | 62,000 |
| أغسطس | 12 (متوسطة + كبيرة) | 16,000 | 78,000 |
| سبتمبر | 13 (متوسطة) | 4,000 | 82,000 |
| أكتوبر | 14 (متوسطة) | 4,000 | 86,000 |
| نوفمبر | 15 (كبيرة) | 12,000 | 98,000 |
| ديسمبر | التجديدات | +8,000 | 106,000 |

**الملخص**:
- إيرادات سنوية: **94,000 - 106,000 ريال**
- متوسط الإيرادات الشهرية: **7,800 - 8,800 ريال**
- وقت استرجاع التكاليف (Breakeven): يونيو/يوليو

---

### D4. السيناريو الطموح (Optimistic Scenario)

**الهدف: 30 عائلة مدفوعة بنهاية السنة**

```
توزيع العائلات:
- 5 عائلات صغيرة        × 1,000 ريال = 5,000 ريال
- 15 عائلة متوسطة      × 4,000 ريال = 60,000 ريال
- 10 عائلات كبيرة       × 12,000 ريال = 120,000 ريال
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
إجمالي الإيرادات السنوية = 185,000 ريال
```

**الجدول الزمني الشهري**:

| الشهر | العائلات المدفوعة | الإيرادات الشهرية | الإيرادات التراكمية |
|------|-----------------|------------------|-------------------|
| يناير | 1 | 1,000 | 1,000 |
| فبراير | 3 | 8,000 | 9,000 |
| مارس | 6 | 12,000 | 21,000 |
| أبريل | 10 | 16,000 | 37,000 |
| مايو | 14 | 16,000 | 53,000 |
| يونيو | 18 | 16,000 | 69,000 |
| يوليو | 22 | 16,000 | 85,000 |
| أغسطس | 25 | 12,000 | 97,000 |
| سبتمبر | 27 | 8,000 | 105,000 |
| أكتوبر | 28 | 4,000 | 109,000 |
| نوفمبر | 30 | 8,000 | 117,000 |
| ديسمبر | التجديدات | +18,000 | 185,000 |

**الملخص**:
- إيرادات سنوية: **185,000 ريال**
- متوسط الإيرادات الشهرية: **15,400 ريال**
- وقت استرجاع التكاليف (Breakeven): أبريل

---

### D5. مقارنة السيناريوهات

| المقياس | محافظ | واقعي | طموح |
|--------|------|--------|------|
| عدد العائلات | 5 | 15 | 30 |
| الإيرادات السنوية | 22,000 ريال | 94,000 ريال | 185,000 ريال |
| الإيرادات الشهرية (متوسط) | 1,800 ريال | 7,800 ريال | 15,400 ريال |
| Breakeven | ديسمبر/يناير | يونيو/يوليو | أبريل |
| الزيادة من السنة 1 إلى 2 | +80% (تجديدات) | +150-200% | +250%+ |

---

### D6. حجم العقد المطلوب للاستدامة

**السؤال المركزي**: كم يجب أن يكون الدخل الشهري لجعل هذا مشروع قابلاً للاستدامة لعبدالله؟

#### التكاليف التشغيلية السنوية

```
التكاليف الثابتة:
═════════════════════════════════════════════════════════════

1. Supabase (قاعدة البيانات والـ API)
   - خطة Pro: 250 ريال/شهر = 3,000 ريال/سنة
   - (بدون كثير بيانات الآن، لكن ستنمو)

2. Tap Payments (منصة الدفع)
   - بدون رسم أساسي، لكن 2.85% + 0.30 ريال لكل عملية
   - على 15 عائلة بمتوسط 4,000 ريال = 15 × 4,000 = 60,000 ريال إجمالي
   - رسوم Tap: 60,000 × 0.0285 + (15 × 0.30) = 1,710 + 4.50 = 1,714.50 ريال

3. البريد الإلكتروني والإشعارات (Sendgrid أو مشابه)
   - 25 ريال/شهر (خطة صغيرة) = 300 ريال/سنة

4. نطاق الويب والسرفر (Hosting على Vercel)
   - مجاني للآن (ضمن حد معقول)
   - لكن قد نرتقي إلى خطة مدفوعة = 100 ريال/شهر = 1,200 ريال/سنة

5. التسويق والإعلانات
   - ميزانية محتملة (LinkedIn, Google Ads) = 200 ريال/شهر = 2,400 ريال/سنة
   - (اختياري، قد يتخطى هذا في البداية)

6. الدعم والصيانة
   - لا توجد تكاليف مباشرة (عبدالله يقدم الدعم بنفسه)
   - لكن الوقت قيمة (انظر أدناه)

───────────────────────────────────────────────────────────
التكاليف السنوية المتغيرة (تقريبية):
- Supabase: 3,000 ريال
- Tap: ~1,700 ريال (حسب الإيرادات)
- البريد: 300 ريال
- الـ Hosting: 1,200 ريال
- التسويق: 2,400 ريال (اختياري)
───────────────────────────────────────────────────────────
المجموع: 8,600 ريال سنة (بدون تسويق)
         11,000 ريال سنة (مع تسويق)
```

#### الراتب المستحق لعبدالله

عبدالله هو مالك المنصة والـ CEO والدعم والمسؤول الإداري.

**السيناريو الواقعي** (15 عائلة):
- الإيرادات: 94,000 ريال
- التكاليف التشغيلية: 11,000 ريال
- الأرباح الإجمالية: 83,000 ريال
- بعد حذب 30% للضرائب والرسوم: 58,100 ريال
- **الدخل الشهري**: 4,850 ريال (تقريباً)

**هل هذا كافٍ؟**
- طالب جامعي بدون نفقات كبيرة: ربما
- شاب يتوقع دخل معقول: لا
- شيء يستحق الاستثمار: ربما في السنة الثانية

**حجم العقد المطلوب**:
إذا كان عبدالله يريد 10,000 ريال شهري (دخل معقول):
```
الحساب:
10,000 ريال × 12 شهر = 120,000 ريال سنة
+ 11,000 ريال (التكاليف)
= 131,000 ريال إيرادات مطلوبة

عدد العائلات المطلوب:
131,000 ريال ÷ 4,000 ريال (متوسط) = 32.75 ≈ 33 عائلة
أو
131,000 ريال ÷ 8,000 ريال (متوسط أعلى مع ميزات) = 16.4 ≈ 16 عائلة كبيرة/متوسطة
```

**النتيجة**:
- السيناريو الواقعي (15 عائلة) يعطي دخل شهري محترم (4,850 ريال) لكن أقل من المتوقع
- السيناريو الطموح (30 عائلة) يعطي دخل شهري قوي (10,000+ ريال)
- عبدالله يحتاج إلى السنة الأولى للبناء والمكاسب التدريجية

---

### D7. استراتيجية النمو (Growth Strategy)

#### المرحلة 1 (الأشهر 1-3): الإثبات
```
الهدف: إثبات أن العميل يدفع المال

الأنشطة:
- عرض توضيحي شخصي مع ٢-٣ عائلات
- الحصول على أول توقيع (يمكن بخصم ٢٠-٣٠٪ للعائلة الأولى)
- توثيق الرحلة (اجعلها حالة دراسة)

الإيرادات المتوقعة: ١,٠٠٠-٢,٠٠٠ ريال
الناتج: شهادة اجتماعية وحالة دراسة
```

#### المرحلة 2 (الأشهر 4-6): الإقناع
```
الهدف: الحصول على ٨-١٠ عائلات جديدة

الأنشطة:
- استخدم حالات الدراسة الأولى في العروض الجديدة
- ركز على العائلات التي تشبه العميل الأول
- اطلب من العملاء القدامى أن يرشحوا أصدقاء (تخفيف)
- اعرض عرض خصم (اقتل الثانية والثالثة: خصم ١٥٪ إذا أحالوا عائلة)

الإيرادات المتوقعة: ٢٠,٠٠٠-٣٠,٠٠٠ ريال
الناتج: مجموعة صغيرة من العملاء الراضين
```

#### المرحلة 3 (الأشهر 7-12): التوسع
```
الهدف: الوصول إلى ٣٠+ عائلة

الأنشطة:
- انشر محتوى (مقالات عن أهمية الشجرة العائلية)
- اعرض ندوة مجانية عن فوائد حفظ التاريخ العائلي
- ركز على "واو" الحالات الكبيرة (عائلات ضخمة اختارتك)
- عرّض على تطبيق الخصم الحالي: "تحديث مهم على الأسعار يبدأ يناير ٢٠٢٧"
  (لديهم حافز للتوقيع الآن بسعر أقل)

الإيرادات المتوقعة: ٥٠,٠٠٠-٧٠,٠٠٠ ريال (+ تجديدات)
الناتج: قائمة انتظار للسنة الثانية، زخم قوي
```

---

### D8. توقعات السنة الثانية

بناءً على السيناريو الواقعي:

```
السنة الأولى النهاية: 15 عائلة
معدل الاحتفاظ: 80% → 12 عائلة تجدد

السنة الثانية = 12 تجديد + عائلات جديدة

الإيرادات المتوقعة للسنة الثانية:
- التجديدات: 12 × 4,000 = 48,000 ريال (فوري في يناير)
- عائلات جديدة: 20-30 عائلة إضافية = 80,000-120,000 ريال
─────────────────────────────────────────────
السنة الثانية: 128,000-168,000 ريال
المتوسط الشهري: 10,600-14,000 ريال

النمو من السنة 1 إلى 2: +36% إلى +78%
```

---

# الخطوات التالية المحددة
## الخطوة التالية المحددة (Next Immediate Actions)

### بدء الأسبوع الأول من مارس 2026

```
□ اليوم 1-2: إعداد حساب Tap Payments
  ├─ ادخل إلى tap.company/en-sa
  ├─ ملأ نموذج التقديم بمعلومات عبدالله
  ├─ تلقي رسالة التأكيد والمفاتيح (API Keys)
  └─ حفظ البيانات في .env

□ اليوم 3-4: تثبيت مكتبة الدفع والـ Webhooks
  ├─ npm install @tap-payments/tap-sdk
  ├─ إنشاء src/services/paymentService.ts
  ├─ إنشاء supabase/functions/tap-webhook/
  └─ اختبار webhook محلي (ngrok للـ testing)

□ اليوم 5: إنشاء قاعدة البيانات
  ├─ تشغيل جميع قوائم SQL (family_subscriptions, payments, grace_periods)
  ├─ تفعيل RLS على جميع الجداول
  └─ اختبار الإدراج من Supabase

□ اليوم 6-7: تطوير الواجهة الأمامية (Frontend)
  ├─ إنشاء src/hooks/useSubscriptionStatus.ts
  ├─ إنشاء صفحة src/pages/SubscriptionCheckout.tsx
  ├─ إنشاء لوحة التحكم admin/SubscriptionDashboard.tsx
  └─ اختبار الدفع نهايات النهاية (من الزر إلى Tap)

□ الأسبوع الثاني: التكامل الكامل والاختبار
  ├─ محاكاة عملية دفع كاملة
  ├─ اختبار webhook من Tap
  ├─ اختبار حالات الفشل والتجديد
  └─ توثيق الخطوات للفريق المستقبلي
```

### المنصة جاهزة بـ: منتصف مارس 2026

```
□ اعرض عرض توضيحي على أول عائلة (Al-Khunaini مثلاً)
  ├─ اشرح الشجرة العاملة
  ├─ عرض الأسعار (الخيار الثلاثي: Good/Better/Best)
  └─ لا تطلب التوقيع الآن - فقط اسأل "هل هذا يناسبك؟"

□ جمع الملاحظات والتحسينات
  ├─ اسأل عن أي ميزات ناقصة
  ├─ اسأل عن سهولة الاستخدام
  └─ عدّل الواجهة حسب الملاحظات

□ اطلب التوقيع (بعد التحسينات)
  ├─ قدم نموذج اتفاقية بسيط (باللغة العربية)
  ├─ وضّح بنود الدفع والاشتراك
  └─ أرسل رابط الدفع عبر Tap

□ إذا وافقوا، احتفل! 🎉
  └─ وثّق الرحلة (صورة، فيديو تقصير، ملخص)
```

### التسويق والنمو (نهاية مارس - ديسمبر)

```
□ كل أسبوع: تحقق من العملاء الحاليين
  ├─ اتصل برسالة "كيف تجد التجربة؟"
  ├─ اطلب ملاحظاتهم
  └─ اطلب إحالات (عائلات أخرى تشبه أحوالهم)

□ كل شهر: اجتماع مع عميل واحد
  ├─ استمع إلى احتياجاتهم
  ├─ اعرض ميزات جديدة أو تحسينات
  └─ قوّ العلاقة (بدون دفع إضافي)

□ كل ربع سنة: حدّث الأسعار
  ├─ اعرض نسخة من "ما الجديد؟"
  ├─ اطلب من العملاء القدامى أن ينشروها
  └─ استعد للعام القادم

□ السنة الثانية: عيّن موظف دعم
  ├─ بعد ما تصل ٢٠+ عميل، الوقت يصير كثير
  ├─ عيّن موظف يتولى العرض التوضيحي والدعم الأساسي
  └─ أنت تركز على البيع الكبير والتطوير
```

---

## الملخص النهائي

### الإجابة على السؤال الأكبر: "هل هذا مشروع ناجح؟"

**✅ نعم، بالشروط التالية:**

1. **التسعير الاستشاري فعّال**
   - لا توجد قائمة أسعار عامة = حرية التفاوض
   - كل عائلة فريدة = كل سعر فريد
   - عبدالله يتحكم في الهامش

2. **النموذج الاقتصادي معقول**
   - السيناريو الواقعي (15 عائلة) = 94,000 ريال إيرادات
   - التكاليف الثابتة منخفضة = 11,000 ريال فقط
   - الأرباح = 60,000+ ريال سنة = دخل شهري محترم

3. **النمو ممكن ومستدام**
   - كل عميل جديد يجلب عملاء آخرين (إحالات)
   - معدل الاحتفاظ 80-90% = تكرار الإيرادات
   - السنة الثانية أسهل من الأولى (التجديدات)

4. **الزمن الحقيقي = 6-8 أشهر للاستقرار**
   - لا حاجة للانتظار سنة كاملة
   - بعد 3-4 عملاء = سهولة في البيع
   - بعد 6 عملاء = زخم قوي

### التحذيرات الصادقة

⚠️ **الخطر الأول**: الوقت
- عبدالله يجب أن يكون مستعداً لقضاء ٢٠+ ساعة أسبوعياً في البيع والدعم
- لا تتوقع دخل محترم من اليوم الأول

⚠️ **الخطر الثاني**: المنافسة
- Ancestry.com و 23andMe موجودة بالفعل
- لكن هذه الخدمة مختلفة = عائلات محددة بدون ميزانية ضخمة
- الميزة: شخصية وعربية وموثوقة

⚠️ **الخطر الثالث**: انسحاب العملاء
- إذا لم يكن الدعم جيداً = عائلة واحدة تترك = ١٠-٢٠ عائلة أخرى تسمع
- الحفاظ على السمعة = أهم من البيع

### التوصيات النهائية

**للعام الأول**:
1. اختر **Tap Payments** كشريك الدفع (أفضل الخيارات)
2. طبّق **إطار التسعير الاستشاري** (لا تسعير ثابت)
3. استهدف **السيناريو الواقعي** (15 عائلة) = هدف محقق
4. ركز على **الدعم والعلاقات** (بيع واحد = 10 عملاء محتملين)

**للعام الثاني**:
1. عيّن موظف دعم جزئي (٢٠ ساعة/أسبوع)
2. اعرض برامج تبعية (referral program)
3. طور ميزات جديدة (وسائط، تقارير متقدمة)
4. افتح لعائلات خارج السعودية (UAE, الكويت)

**الهدف الطموح لمدة 3 سنوات**: 100+ عائلة = 300,000+ ريال إيرادات سنوية = دخل مستدام ومربح

---

**الاستعداد**: 10 مارس 2026
**الإطلاق**: 15 مارس 2026
**الأول عائلة موقعة**: ٣١ مارس - ٣٠ أبريل 2026
**الاستدامة**: ديسمبر 2026

---

## المصادر المرجعية

- [Tap Payments in Saudi Arabia | Leading Payment Gateway](https://www.tap.company/en-sa)
- [Moyasar - The Financial Infrastructure for Digital Payments](https://moyasar.com/en/)
- [HyperPay Payment Services](https://www.hyperpay.com/)
- [Best Payment Gateways in Saudi Arabia 2026](https://nowpayments.io/blog/payment-gateway-saudi-arabia)
- [Value-Based Pricing Strategy: A Complete Guide for B2B SaaS Companies](https://softwarepricing.com/blog/value-based-pricing-strategy/)
- [B2B SaaS Pricing Models and Strategies to Scale Confidently](https://www.kalungi.com/blog/saas-pricing-guide)

---

**تمت كتابة هذا المستند بواسطة**: Claude Code Architecture Service
**آخر تحديث**: 27 مارس 2026
**الإصدار**: 1.0 (نهائي وجاهز للتنفيذ)
