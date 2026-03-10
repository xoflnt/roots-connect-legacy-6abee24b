

# إصلاح التخطيط ومنع سحب البطاقات

## التغييرات المطلوبة

### 1. `src/hooks/useTreeLayout.ts`
- تغيير `NODE_WIDTH` من `240` إلى `280`
- تغيير `NODE_HEIGHT` من `150` إلى `160`
- تغيير `nodesep` من `80` إلى `150`
- تغيير `ranksep` من `120` إلى `250`

### 2. `src/components/FamilyTree.tsx`
- إضافة `nodesDraggable={false}` في خصائص `<ReactFlow>`

### 3. إصلاح خطأ البناء (dagre)
مكتبة `dagre` غير مثبتة في `package.json`. يجب إضافتها كـ dependency مع `@types/dagre`.

