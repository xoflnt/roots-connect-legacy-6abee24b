

# Fix: Consistent `getFirstName` for Children Chips

## Problem
Current code splits only on `" بن "`, missing female names like `"ألماس بنت علي"`.

## Solution
Add a shared `getFirstName` utility and use it in all 4 files.

### 1. Create `src/utils/nameUtils.ts`
```ts
export function getFirstName(fullName: string): string {
  return fullName.split(/\s+بن[تة]?\s+/)[0].trim();
}
```

### 2. Update 4 files
Replace `.split(' بن ')[0]` with `getFirstName(child.name)`:

- **`src/components/PersonDetails.tsx`** (line 297)
- **`src/components/admin/members/MemberDetailSheet.tsx`** (line 146)
- **`src/components/LineageView.tsx`** (line 477)
- **`src/pages/Profile.tsx`** (line 312)

Each file gets `import { getFirstName } from "@/utils/nameUtils"` added.

### 3. `OnboardingModal.tsx` — no change
Already uses `.split(" ")[0]` which works correctly for its context.

### 4. `KinshipCardView.tsx` — no change
Does not display children as chips.

**Total: 5 files touched** (1 new utility + 4 updated imports/usages).

