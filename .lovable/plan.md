

# Smart Genealogy Report Export

## Overview
Upgrade the CSV export in `Admin.tsx` from a raw dump to a smart report with sub-tree export and human-readable Arabic columns.

## Changes to `src/pages/Admin.tsx`

### New state
- `exportSearch: string` — search query for descendant export
- `exportResults: FamilyMember[]` — search results dropdown
- `selectedExportMember: FamilyMember | null` — chosen root for sub-tree

### New helper: `getDescendants(rootId, allMembers, gen = 1)`
Returns `Array<FamilyMember & { generation: number }>` by recursively collecting children via `father_id`, incrementing generation each level.

### Refactored `buildCSVRows(members, memberMap, isSubtree)`
Shared formatting for both full and sub-tree exports:
- Headers: `"مستوى الجيل"`, `"الاسم"`, `"اسم الأب"`, `"الجنس"`, `"سنة الميلاد"`, `"رقم الجوال"`, `"الزوجات"`, `"ملاحظات وتفاصيل الأم"`
- Resolve `father_id` → father name, map gender to ذكر/أنثى, proper quoting, BOM prefix

### `handleExportFull()`
- Uses `buildCSVRows(getAllMembers(), map, false)` — generation column left blank
- Filename: `khunaini_registry_full.csv`

### `handleExportDescendants()`
- Calls `getDescendants(selectedMember.id, ...)` 
- Uses `buildCSVRows(descendants, map, true)` — generation column populated
- Filename: `khunaini_descendants_of_[name].csv`

### UI in registry tab toolbar
```
[تصدير السجل الكامل (CSV)]   |   [Search input: تصدير ذرية شخص محدد]  [تصدير ذرية المختار]
```
- Search input with dropdown results (reuses `searchMembers`)
- Selected member shown as a badge with X to clear
- "تصدير ذرية المختار" button disabled until a member is selected

## Files
| File | Change |
|---|---|
| `src/pages/Admin.tsx` | Add sub-tree export UI + refactor CSV generation |

