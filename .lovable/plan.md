

# Two Improvements: Eastern Arabic Digits + Tatweel on User Name

## Improvement 1: Eastern Arabic Digits

### New file: `src/utils/arabicUtils.ts`
Create with a single exported function:
```ts
export function toArabicNum(n: number | string): string {
  return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}
```

### Files to modify (import `toArabicNum` + wrap values)

| File | Line | Current | New |
|------|------|---------|-----|
| `LandingPage.tsx` | 104 | `{counter.value}{suffix}` | `{toArabicNum(counter.value)}{suffix}` |
| `LandingPage.tsx` | 520 | `{pillar.descendants} فرد` | `{toArabicNum(pillar.descendants)} فرد` |
| `Admin.tsx` | 72 | `{value}` | `{toArabicNum(value)}` |
| `Admin.tsx` | 304 | `({requests.length})` | `({toArabicNum(requests.length)})` |
| `Admin.tsx` | 319 | `({pending.length})` | `({toArabicNum(pending.length)})` |
| `Profile.tsx` | 217 | `{children.length}` | `{toArabicNum(children.length)}` |
| `Profile.tsx` | 299 | `({children.length})` | `({toArabicNum(children.length)})` |
| `PersonDetails.tsx` | 258 | `({children.length})` | `({toArabicNum(children.length)})` |
| `ListView.tsx` | 308 | `{children.length}` | `{toArabicNum(children.length)}` |
| `DataTableView.tsx` | 163 | `{filtered.length} فرد` | `{toArabicNum(filtered.length)} فرد` |
| `DataTableView.tsx` | 317 | `{childrenMap.get(m.id)!.length}` | `{toArabicNum(childrenMap.get(m.id)!.length)}` |

---

## Improvement 2: Tatweel on Dashboard User Name

### File: `src/components/LandingPage.tsx`
- Add import: `import { applyTatweel } from "@/utils/tatweelUtils";`
- At line 235, replace `{currentUser.memberName}` with an inline expression that applies tatweel to the first word only:
```tsx
{(() => {
  const parts = currentUser.memberName.split(' ');
  parts[0] = applyTatweel(parts[0]);
  return parts.join(' ');
})()}
```

---

## Summary
- **1 new file** created
- **7 files** modified (LandingPage gets both changes)
- All numeric displays converted to Eastern Arabic (٠-٩)
- User's first name gets tatweel in dashboard card

