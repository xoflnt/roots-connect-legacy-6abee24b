

# UX Hotfix — Dynamic Mother Select, Double-Fire, State Sync, Profile CTA

## 1. Dynamic Mother Selection Dropdown

### `Profile.tsx` (lines 270-280)
Already has a spouse-based `<Select>` but only shows `editSpouses`. Fix:
- Always show the mother select (remove `editSpouses.length > 0` gate)
- Add an "أخرى (إدخال يدوي)" option as fallback
- When "أخرى" is selected, reveal a text `<Input>` below
- New state: `customMother` string, logic to use `customMother` when `newChildMother === "__other__"`

### `OnboardingModal.tsx` (lines 657-662)
Currently a plain text `<Input>` for `quickChildMother`. Replace with:
- A `<Select>` populated from `familyContext.spouses` + the newly-added `quickSpouse` (if non-empty)
- Add "أخرى (إدخال يدوي)" fallback option revealing a text input
- New state: `quickChildMotherCustom`

## 2. Fix Double-Fire Bug

### `Profile.tsx`
- Add `type="button"` to the "إضافة" child button (line 282) and spouse add button (line 224)
- The save button (line 318) already has `disabled={saving}` — confirmed OK
- Add child button (line 282): already has `disabled={!newChildName.trim() || saving}` — confirmed OK

### `OnboardingModal.tsx`
- Add `type="button"` to "حفظ والدخول للبوابة" (line 681) and "تخطي" (line 684)
- Add a local `isSubmitting` guard in `handleComplete` to prevent double-fire

## 3. Profile State Synchronization

### `Profile.tsx`
Add a `useEffect` that listens to the `family-data-updated` event:
```typescript
useEffect(() => {
  const handler = async () => {
    await refreshMembers();
    setRefreshKey(k => k + 1);
  };
  window.addEventListener("family-data-updated", handler);
  return () => window.removeEventListener("family-data-updated", handler);
}, []);
```
This triggers `refreshKey` change → all `useMemo` hooks (member, chain, children, descendantCount) recompute. Also re-initialize `editSpouses` from the refreshed member data.

## 4. Profile CTA on Landing Page

### `LandingPage.tsx`
- Import `useAuth` from `@/contexts/AuthContext` and `useNavigate` from react-router-dom
- After the search bar section (~line 220), add a conditional block:
```tsx
{currentUser && (
  <div className="max-w-lg mx-auto px-4 pb-4">
    <Button onClick={() => navigate("/profile")} className="w-full min-h-[48px] rounded-xl font-bold text-base gap-2">
      <UserCircle className="h-5 w-5" />
      الانتقال لملفي الشخصي
    </Button>
  </div>
)}
```

## Files Changed

| File | Change |
|---|---|
| `src/pages/Profile.tsx` | Dynamic mother select with fallback, `type="button"`, `family-data-updated` listener |
| `src/components/OnboardingModal.tsx` | Dynamic mother select from spouses, `type="button"`, double-fire guard |
| `src/components/LandingPage.tsx` | Profile CTA button for logged-in users |

