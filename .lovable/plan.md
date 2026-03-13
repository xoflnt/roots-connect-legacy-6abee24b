

# إصلاح التحميل + تحسين استعراض المستند بـ Pinch-to-Zoom

## المشاكل

1. **التحميل**: زر التحميل يستخدم `document.createElement("a")` مع `.click()` — هذا لا يفرض اسم ملف بصيغة `.jpg` بشكل صحيح. الملف الفعلي `doc-1.jpg` هو صورة، لكن المتصفح قد يتعامل معه بشكل غريب. الحل: استخدام `fetch` + `Blob` + `URL.createObjectURL` لضمان تحميل الملف بالاسم والصيغة الصحيحة.

2. **Pinch-to-Zoom**: حالياً `touch-action: pinch-zoom` موجود لكنه لا يعمل فعلياً لأن الصورة محددة بـ `max-h-[70vh]` والـ container لا يسمح بالتكبير الحقيقي. الحل: إضافة pinch-zoom يدوي باستخدام touch events (scale transform) أو استخدام CSS `overflow: auto` مع صورة بحجمها الكامل يمكن التمرير عليها بعد التكبير.

## التغييرات

| ملف | التغيير |
|-----|---------|
| `src/pages/Documents.tsx` | 1. إصلاح `handleDownload` ليستخدم fetch+blob للتحميل الصحيح<br>2. إضافة pinch-to-zoom تفاعلي للصورة في العارض باستخدام touch events + CSS transform |

### تفاصيل تقنية

**التحميل المحسّن:**
```typescript
const handleDownload = async (doc) => {
  const response = await fetch(doc.imagePath);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.title}.jpg`;
  a.click();
  URL.revokeObjectURL(url);
};
```

**Pinch-to-Zoom:**
- إضافة state لـ `scale` و `position`
- معالجة `onTouchStart`/`onTouchMove`/`onTouchEnd` لحساب المسافة بين إصبعين وتحديث `transform: scale()`
- زر إعادة تعيين التكبير
- دعم double-tap للتكبير/التصغير السريع

