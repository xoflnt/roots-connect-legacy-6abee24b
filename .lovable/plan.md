

# Add Static Member Count to Admin Sync UI

## Changes (single file: `src/pages/Admin.tsx`)

### 1. Add `STATIC_COUNT` constant (after line 10)
Add immediately after the `familyMembers` import:
```ts
const STATIC_COUNT = familyMembers.length;
```

### 2. Display count next to sync button (line 311–313 area)
Add the static count display inside the sync section, after the Button and before or alongside the syncResult span:
```tsx
<span className="text-xs font-semibold bg-white/20 rounded-lg px-2 py-1">
  ({toArabicNum(STATIC_COUNT)} عضو في الملف)
</span>
```

This will show the bundle-time array length directly in the UI, confirming whether the import contains 477 or fewer members — no DevTools needed.

