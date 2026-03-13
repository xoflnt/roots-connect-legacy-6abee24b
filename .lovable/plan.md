

# إصلاح عارض المستندات + إضافة تفاعل + زر لوحة التحكم

## المشاكل الحالية (من الصورة)
- العارض يعرض الصورة بشكل ممتد خارج الشاشة بدون تحكم
- لا يوجد زر تحميل أو تفاعل

## التغييرات المطلوبة

### 1. إصلاح عارض المستند (`src/pages/Documents.tsx`)
- تغيير Dialog ليكون كامل الشاشة مع صورة محتواة بشكل صحيح (`object-contain` + `max-h-[85vh]`)
- إضافة شريط أدوات سفلي في العارض يحتوي: زر تحميل، زر إعجاب، عدد الإعجابات

### 2. إضافة زر تحميل
- استخدام `<a download>` لتحميل الصورة مباشرة
- أيقونة `Download` من lucide

### 3. إضافة إعجاب وتعليقات (جداول جديدة في قاعدة البيانات)

**جدول `document_likes`:**
```sql
CREATE TABLE document_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  user_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, user_phone)
);
```

**جدول `document_comments`:**
```sql
CREATE TABLE document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  user_name text NOT NULL,
  user_phone text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

- RLS: سماح للجميع بالقراءة (محتوى عام)، الإدراج للجميع (بدون auth — المستخدمون يعتمدون على localStorage auth)
- الإعجاب: toggle بحسب `user_phone` من `currentUser`
- التعليقات: قائمة أسفل المستند مع حقل إدخال

### 4. واجهة التفاعل في صفحة المستندات
- أسفل كل بطاقة مستند: عداد إعجابات + عداد تعليقات
- في العارض ال