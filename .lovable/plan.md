

# تدفق الترحيب والتسجيل — Welcome Onboarding & Registration Flow

## الملفات الجديدة

### 1. `src/contexts/AuthContext.tsx`
- Context + Provider يحفظ `currentUser` في localStorage (key: `khunaini-current-user`)
- الحقول: `memberId`, `memberName`, `phone`, `hijriBirthDate`
- دوال: `login(data)`, `logout()`, computed `isLoggedIn`
- يتحقق من localStorage عند التحميل

### 2. `src/services/wasageSms.ts`
- `sendOTP(phone: string): Promise<boolean>` — محاكاة 2 ثانية ثم true
- `verifyOTP(phone: string, code: string): Promise<boolean>` — يقبل "1234" فقط
- تعليقات توضح مكان مفاتيح wasage.com API

### 3. `src/components/OnboardingModal.tsx`
مودال متعدد المراحل (Dialog) يفتح تلقائياً لأول زيارة:

**Stepper بـ 5 مراحل:**

| المرحلة | المحتوى |
|---------|---------|
| 1 — الترحيب | عنوان + وصف مختصر + زر "التالي" |
| 2 — الإرشاد | 3 بطاقات بصرية (تصفح، ابحث، سجّل) |
| 3 — البحث والمطالبة | Combobox يبحث في familyData، كل عنصر يعرض "الاسم (ابن [اسم الأب])" عبر father_id lookup. عند الاختيار → تأكيد بزرين كبيرين 52px |
| 4 — الهاتف + OTP | حقل +966 كبير → 4 خانات OTP عبر input-otp → يستخدم wasageSms المحاكي |
| 5 — تاريخ الميلاد | حقل هجري (نص مثل "١٤٠٥/٣/١٥") → زر "إكمال التسجيل" |

**تفاصيل UX:**
- Progress indicator علوي (5 نقاط)
- أزرار بارتفاع min-h-[52px] وtouch targets 44px+
- عناصر dropdown بارتفاع min-h-[44px]
- رسائل خطأ بالعربي
- انتقالات fade بين المراحل
- لا يُغلق المودال بالنقر خارجه (فقط بزر تخطي أو إكمال)

## تعديلات على ملفات موجودة

### `src/App.tsx`
- إضافة `<AuthProvider>` يغلف التطبيق

### `src/pages/Index.tsx`
- إضافة `<OnboardingModal />` — يظهر إذا لم يكن المستخدم مسجلاً ولم يرَ الـ onboarding

### `src/components/AppHeader.tsx`
- إضافة تحية "مرحباً، [الاسم الأول]" بجانب أزرار الثيم إذا `isLoggedIn`
- أيقونة User صغيرة

## تفاصيل تقنية
- **لا تعديل على familyData.ts** — قراءة فقط
- father name lookup: `familyMembers.find(m => m.id === member.father_id)?.name`
- التخزين: localStorage فقط، لا Supabase
- الرمز "1234" يُقبل دائماً للاختبار
- زر "تخطي" متاح في كل مرحلة (يحفظ `hasSeenOnboarding` ويغلق)

| الملف | العملية |
|-------|---------|
| `src/contexts/AuthContext.tsx` | جديد |
| `src/services/wasageSms.ts` | جديد |
| `src/components/OnboardingModal.tsx` | جديد |
| `src/App.tsx` | تعديل — AuthProvider |
| `src/pages/Index.tsx` | تعديل — OnboardingModal |
| `src/components/AppHeader.tsx` | تعديل — تحية المستخدم |

