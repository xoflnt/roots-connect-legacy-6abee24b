

# Fix: Login/Registration "حدث خطأ أثناء الحفظ" Bug

## Root Cause

The onboarding save flow in `OnboardingModal.tsx` calls two functions in the wrong order:

1. `updateMember(id, { phone, birth_year })` -- requires auth
2. `registerVerifiedUser(...)` -- creates the auth record

**Problem**: `updateMember` reads `requesterPhone` from `localStorage("khunaini-current-user")`, but the user isn't logged in yet, so it's `undefined`. The edge function then checks `verified_users` for a matching phone -- but that record doesn't exist yet either. Both auth paths fail, returning **403 Unauthorized**.

```text
Current flow (broken):
  updateMember() → needs phone from localStorage → empty → 403
  registerVerifiedUser() → never reached

Fixed flow:
  registerVerifiedUser() → creates verified_users record
  updateMember() → pass phone directly → self-check succeeds
```

## Changes

### 1. `src/components/OnboardingModal.tsx` (lines 150-201)

Swap the order of operations in `handleComplete`:

1. Call `registerVerifiedUser()` FIRST (creates the verified_users record)
2. Then call `updateMember()` with the phone passed explicitly as a parameter (not from localStorage)
3. Children updates also need the phone passed explicitly

### 2. `src/services/dataService.ts` (line 70-74)

Add an optional `requesterPhone` parameter to `updateMember` so callers can pass it directly instead of relying on localStorage:

```typescript
export async function updateMember(
  id: string, 
  data: Partial<FamilyMember>, 
  adminToken?: string,
  requesterPhone?: string  // NEW: explicit phone override
): Promise<void> {
  const headers = adminToken ? { "x-admin-token": adminToken } : undefined;
  // Use explicit phone if provided, fall back to localStorage
  const phone = requesterPhone 
    || JSON.parse(localStorage.getItem("khunaini-current-user") || '{}')?.phone;
  await callFamilyApi("update-member", { id, data, requesterPhone: phone }, headers);
}
```

### 3. `src/components/OnboardingModal.tsx` -- updated save order

```typescript
// Step 1: Register as verified user FIRST
await registerVerifiedUser({
  memberId: selectedMember.id,
  memberName: selectedMember.name,
  phone: `+966${phone}`,
  hijriBirthDate: dateStr,
});

// Step 2: Now update member (self-check will find the verified_users record)
const fullPhone = `+966${phone}`;
await updateMember(selectedMember.id, memberUpdates, undefined, fullPhone);

// Step 3: Children updates with explicit phone
for (const [childId, cDate] of Object.entries(childrenDates)) {
  // ... same but pass fullPhone
}
```

## Files Modified
- `src/services/dataService.ts` -- add explicit phone parameter to `updateMember`
- `src/components/OnboardingModal.tsx` -- reorder: register first, then update with explicit phone

## Why this was missed
The `updateMember` auth-gating was added after the onboarding flow was built. The onboarding flow assumed `updateMember` was public, but the security fix made it require either admin token or verified phone -- which doesn't exist during first-time registration.

