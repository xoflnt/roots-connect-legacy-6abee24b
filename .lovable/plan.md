

# Fix: Data Visibility for Guests

## Root Cause
`loadMembers()` (which fetches cloud data AND verified IDs) is **never called on app startup**. It only runs when `refreshMembers()` is triggered by `family-data-updated` events after a user edit. So guests always see the static fallback data with no verified badges.

The RLS policies are fine — both `family_members` and `verified_users` allow `anon` SELECT. The problem is purely frontend: the initial cloud fetch is missing.

## Fix

**`src/pages/Index.tsx`** — Add a one-time `loadMembers()` call on mount so cloud data + verified IDs are loaded for all visitors (guests included).

```typescript
import { loadMembers } from "@/services/familyService";

// Inside the component, before render:
const [ready, setReady] = useState(false);
useEffect(() => {
  loadMembers().finally(() => setReady(true));
}, []);
```

This single change ensures:
- Cloud member data (with updated birth years, phones, etc.) replaces static fallback on first load
- `loadVerifiedMemberIds()` runs inside `loadMembers()`, populating the verified IDs cache
- All downstream components (`FamilyTree`, `FamilyCard`, `PersonDetails`, `ListView`) pick up the cloud data and verified badges
- Logout only clears `currentUser` session — family data stays intact (already the case in `AuthContext.logout`)

**`src/components/LandingPage.tsx`** — Same pattern: call `loadMembers()` on mount so landing page stats reflect cloud data.

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Add `loadMembers()` on mount |
| `src/components/LandingPage.tsx` | Add `loadMembers()` on mount for stats accuracy |

