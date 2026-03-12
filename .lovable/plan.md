

# Three Enhancements: Mandatory Birth Date, Tokenized Search, Verified Badge

## 1. Mandatory Hijri Birth Date (OnboardingModal.tsx)

**Changes:**
- Remove the "تخطي" (Skip) button on Step 5 (line 625-627)
- Disable the "حفظ والدخول للبوابة" button unless `hijriDate.year` is set
- In `handleComplete`, after `registerVerifiedUser` succeeds, call `refreshMembers()` and dispatch `family-data-updated` event before closing

## 2. Smart Tokenized Search (familyService.ts)

**Change `searchMembers` function:**
- Normalize query, split into tokens by spaces
- Match only if ALL tokens exist in the normalized member name
- Keep existing limit parameter

```typescript
export function searchMembers(query: string, limit = 10): FamilyMember[] {
  if (!query.trim()) return [];
  const q = normalizeForSearch(query);
  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length === 0) return [];
  return mergedMembers
    .filter((m) => {
      const normalized = normalizeForSearch(m.name);
      return tokens.every((t) => normalized.includes(t));
    })
    .slice(0, limit);
}
```

## 3. Verified Account Badge (FamilyCard.tsx + PersonDetails.tsx)

**New service: fetch verified user IDs**
- Add `getVerifiedMemberIds()` to `dataService.ts` that queries `verified_users` table and returns a `Set<string>` of member IDs, cached in memory

**FamilyCard.tsx:**
- Import `BadgeCheck` from lucide-react and `Tooltip` components
- Add `isVerified` prop to the card data (computed in `useTreeLayout.ts` or passed via data)
- Show green `BadgeCheck` icon next to the name with tooltip "حساب موثق"

**PersonDetails.tsx:**
- Same badge next to member name in the detail panel

**Data flow:** Load verified IDs once at app startup (alongside `loadMembers`), expose via a synchronous getter, and use in both components.

## Files to modify:
| File | Change |
|---|---|
| `src/components/OnboardingModal.tsx` | Remove skip button, require year, refresh after save |
| `src/services/familyService.ts` | Tokenized search |
| `src/services/dataService.ts` | Add `getVerifiedMemberIds()` + cache |
| `src/components/FamilyCard.tsx` | Verified badge with tooltip |
| `src/components/PersonDetails.tsx` | Verified badge with tooltip |
| `src/hooks/useTreeLayout.ts` | Pass `isVerified` flag in node data |

