# CLAUDE.md

## CRITICAL RULES -- READ FIRST

### NEVER Change

- **Static family data** in `src/data/familyData.ts` — this is the source of truth for the family tree. Cloud data only enriches it; it never replaces it. The merge strategy in `src/services/familyService.ts:loadMembers()` strips null/empty cloud values so static data is never blanked.
- **ID format convention** — root members use numeric IDs (`100`, `200`, `300`, `400`), descendants use prefixed hierarchical IDs like `M203_1`, `M204_5_2`. The prefix letter indicates the branch. The `generateMemberId()` function in both `src/utils/idGenerator.ts` and `supabase/functions/family-api/index.ts` must stay in sync.
- **The three pillar IDs** — `200` (Muhammad), `300` (Nasser), `400` (Abdulaziz). These are hardcoded in `src/utils/branchUtils.ts:PILLARS` and used throughout the UI for branch coloring, filtering, and classification.
- **RLS policies** — after the security lockdown migration (`20260314022608`), anon/authenticated clients can only SELECT from `family_members`, `visit_stats`, `document_likes`, `document_comments`, `notifications`. All writes go through edge functions with `service_role`. Do not add permissive write policies.
- **The `DOCUMENTER_ID = "209"` and `ADMIN_MEMBER_IDS = ["209", "M209_3"]`** in `src/utils/branchUtils.ts` — these control who gets the documenter badge and are referenced by admin logic.
- **Mother name extraction regex** — `والدت[هها]+:\s*([^-–,،]+)` in `src/services/familyService.ts:extractMotherName()`. This parses the `notes` field. All mother names in static data follow this format.
- **Arabic text normalization** in `src/services/familyService.ts:normalizeForSearch()` and `src/utils/normalizeArabic.ts` — these handle alef variants, taa marbuta, yaa/alef maqsura. Changing these breaks search.
- **Privacy rules** in `src/utils/privacyUtils.ts` — guests cannot see ages, spouses, or mother names except for specifically exempt ancestor IDs. This is a family privacy decision.

### Fragile Areas

- **`useTreeLayout` hook** (`src/hooks/useTreeLayout.ts`) — complex d3-hierarchy layout with mother-based color grouping, generation bands, and filter logic. Changes here affect the entire tree rendering. Test with expand-all and all filter combinations.
- **`familyService.ts` merge logic** (`loadMembers`) — the `stripNulls` function and merge order are critical. Static members are the base; cloud can only add or enrich, never remove.
- **Kinship calculation** (`findKinship`, `kinshipToArabic`, `kinshipDirectional`) in `src/services/familyService.ts` — ~170 lines of hand-coded Arabic kinship terms for all distance combinations, with gender-awareness and full/half sibling detection. These are culturally sensitive.
- **Admin auth flow** — uses `sessionStorage` (not `localStorage`), 2-hour expiry, validated server-side via `admin_sessions` table. The `AdminProtect` component and `getAdminToken()` utility must stay synchronized.
- **Tatweel utility** (`src/utils/tatweelUtils.ts`) — respects Arabic letter connectivity rules and exempts sacred words. Used in card rendering and headings.
- **Edge function routing** — `supabase/functions/family-api/index.ts` uses URL path segments for routing. All 17+ actions are in one file. Adding actions must follow the existing pattern of path extraction and admin token validation.

### Non-Negotiables

- **All user-facing text is Arabic**. All date formats are Hijri. All numerals displayed to users are Eastern Arabic (Indic digits: ٠١٢٣٤٥٦٧٨٩).
- **RTL layout** — `<html lang="ar" dir="rtl">` is set in `index.html`. All components assume RTL. Never add `dir="ltr"` except for phone number inputs and code-like fields.
- **PWA requirements** — the app is a standalone PWA with `injectManifest` strategy. The service worker (`src/sw.ts`) handles precaching, offline fallback, push notifications, and `SKIP_WAITING` messages. Do not switch to `generateSW`.
- **No Supabase Auth** — the project uses a custom auth system (passcode + phone). There are no Supabase Auth users. The `supabase.auth` session is anonymous. All identity is managed through `verified_users` table + localStorage.
- **Font: YearOfHandicrafts** — a custom Arabic OTF font loaded via `@font-face` in `src/index.css`. Body is invisible (`opacity: 0`) until fonts load (`.fonts-loaded` class added in `src/main.tsx`). This prevents FOUT.

---

## WHAT THIS IS

A family heritage portal ("بوابة تراث الخنيني") for the Al-Khunaini family, specifically the Az-Zulfi branch. It's a bilingual-aware (but primarily Arabic) PWA that lets family members explore their genealogical tree, calculate kinship between any two members, view lineage chains, browse by branches, submit change requests, and manage their profiles. An admin panel allows family administrators to manage members, review requests, send notifications, and monitor data health. The app serves ~500+ family members across 6+ generations and is deployed on Lovable's hosting at `roots-connect-legacy.lovable.app`.

---

## HOW IT WORKS

### Mental Model

```
  [Static familyData.ts]  +  [Supabase family_members table]
           |                            |
           v                            v
     familyService.ts  ←─── merge (static = base, cloud enriches)
           |
           v
    mergedMembers[] (in-memory)
           |
    ┌──────┼──────────┬──────────────┐
    v      v          v              v
 FamilyTree   SmartNavigate   KinshipCalc   ListView
 (ReactFlow)  (card-by-card)  (LCA-based)   (flat list)
```

**Data Flow**: On app load, `loadMembers()` fetches cloud data from Supabase and merges it with the static `familyData.ts`. Static data is always the base — cloud values are overlaid only if non-null/non-empty. The merged array is stored in module-level variables (`mergedMembers`, `memberMap`, `childrenMap`). All components read from these via exported functions (`getMemberById`, `getChildrenOf`, `searchMembers`, etc.).

**Auth Flow (User)**: Landing page → Onboarding modal → Search for your name → Enter family passcode (verified server-side via `family-api/verify-passcode`) → Enter phone number → Optional Hijri birth date → `registerVerifiedUser()` creates/upserts entry in `verified_users` table → User data stored in `localStorage["khunaini-current-user"]`.

**Auth Flow (Admin)**: Navigate to `/admin` → `AdminProtect` component checks `sessionStorage` for valid token → If none, show password form → Password sent to `admin-auth` edge function → On success, `{ token, expiresAt }` stored in `sessionStorage["khunaini-admin-token"]` and `sessionStorage["khunaini-admin-expiry"]` → Token sent as `x-admin-token` header on all admin API calls → Server validates token against `admin_sessions` table.

**Key Architectural Decisions**:

1. **Static data as source of truth**: The `familyData.ts` file contains all family members with their relationships. This was chosen over a database-only approach because: (a) the app works offline immediately, (b) data integrity is guaranteed even if the database is empty, (c) the seed function can always repopulate from this file.

2. **Custom auth over Supabase Auth**: The family doesn't use email/password accounts. Identity is verified by knowing the family passcode + your phone number. This is simpler and more culturally appropriate.

3. **Edge functions for all writes**: RLS blocks all client-side writes. This ensures data integrity — the edge functions validate admin tokens, verify user identity, and enforce field-level permissions.

4. **Hierarchical IDs**: Member IDs encode the family tree structure (e.g., `M204_5_2` means branch M, child of 204, 5th child, 2nd grandchild). This makes it easy to identify lineage from an ID alone and generate unique child IDs.

---

## CRITICAL FILES

| File | Purpose |
|------|---------|
| `src/data/familyData.ts` | Static source of truth: ~500+ family members with `FamilyMember` interface definition |
| `src/services/familyService.ts` | Core data layer: merge logic, search, kinship calculation, ancestor chains, all member lookups |
| `src/services/dataService.ts` | Supabase API layer: all cloud operations (CRUD members, requests, verified users, visit tracking) |
| `src/contexts/AuthContext.tsx` | User auth state: `CurrentUser` interface, login/logout, localStorage persistence |
| `src/hooks/useTreeLayout.ts` | d3-hierarchy tree layout: computes React Flow nodes/edges with mother-color grouping and filters |
| `src/components/FamilyTree.tsx` | Interactive tree canvas: React Flow wrapper with zoom, expand, search, filters, locate-me |
| `src/components/FamilyCard.tsx` | Tree node renderer: mobile/desktop variants, privacy-aware, shows badges/contacts/branches |
| `src/components/OnboardingModal.tsx` | 5-step registration wizard: name search → passcode → phone → birth date → success |
| `src/components/LandingPage.tsx` | Hero page with search, branch cards, quick actions, visit counter, onboarding trigger |
| `src/components/AdminProtect.tsx` | Admin auth gate: password form, session management, `getAdminToken()` utility |
| `src/utils/branchUtils.ts` | Branch/pillar constants (PILLARS, DOCUMENTER_ID, ADMIN_MEMBER_IDS), branch detection, styling |
| `src/utils/privacyUtils.ts` | Guest privacy rules: which member IDs can see which fields without login |
| `supabase/functions/family-api/index.ts` | Main edge function: 17+ API actions for all server-side operations |
| `supabase/functions/admin-auth/index.ts` | Admin authentication: password check → session token creation/validation |
| `src/index.css` | Design system: all CSS variables (light/dark), font-face declarations, utility classes |

---

## DATABASE

### Tables

#### `family_members`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | Hierarchical: `100`, `200`, `M203_1`, `M204_5_2` |
| `name` | TEXT NOT NULL | Full Arabic name including بن/بنت |
| `gender` | TEXT NOT NULL | `'M'` or `'F'` (CHECK constraint) |
| `father_id` | TEXT | FK → `family_members(id)`, NULL for roots |
| `birth_year` | TEXT | Hijri year, format: `١٣٨٩` or `١٣٨٩/١٢/١٢` |
| `death_year` | TEXT | Same format as birth_year |
| `spouses` | TEXT | Comma-separated (Arabic comma ،): `نورة الخنيني، فوزية البداح` |
| `phone` | TEXT | Saudi format: `05xxxxxxxx` |
| `notes` | TEXT | Contains mother info as `والدته: اسم الأم` pattern |
| `is_archived` | BOOLEAN | Default false. Archived members hidden from public |
| `archived_at` | TIMESTAMPTZ | When archived |
| `created_at` | TIMESTAMPTZ | Default now() |
| `updated_at` | TIMESTAMPTZ | Default now() |

**RLS**: SELECT public. INSERT/UPDATE/DELETE blocked for anon/authenticated — service_role only via edge functions.

#### `verified_users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `member_id` | TEXT UNIQUE | Links to `family_members.id` |
| `member_name` | TEXT NOT NULL | Denormalized for admin display |
| `phone` | TEXT NOT NULL | Saudi phone number |
| `hijri_birth_date` | TEXT | Optional Hijri date |
| `verified_at` | TIMESTAMPTZ | Default now() |

**RLS**: ALL blocked for anon/authenticated — service_role only.

#### `family_requests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `type` | TEXT NOT NULL | `'add_child'`, `'add_spouse'`, `'other'` |
| `target_member_id` | TEXT NOT NULL | The member this request is about |
| `data` | JSONB | `{ spouse_name?, child_name?, child_gender?, text_content? }` |
| `notes` | TEXT | Free-text notes |
| `status` | TEXT | `'pending'` → `'approved'` or `'completed'` |
| `submitted_by` | TEXT | Phone or name of submitter |
| `created_at` | TIMESTAMPTZ | Default now() |

**RLS**: INSERT public (anyone can submit). SELECT/UPDATE blocked — admin reads via edge function.

#### `admin_sessions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `token` | TEXT UNIQUE | Random UUID + timestamp |
| `expires_at` | TIMESTAMPTZ | 2 hours from creation |
| `created_at` | TIMESTAMPTZ | Default now() |

**RLS**: ALL blocked for anon/authenticated — service_role only.

#### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `user_id` | UUID FK | → `verified_users(id)` ON DELETE CASCADE |
| `title` | VARCHAR(255) | Notification title |
| `body` | TEXT | Notification body |
| `type` | TEXT | Validated by trigger: `approval`, `rejection`, `broadcast`, `new_member`, `info` |
| `is_read` | BOOLEAN | Default false |
| `data` | JSONB | Optional metadata |
| `created_at` | TIMESTAMPTZ | Default now() |
| `read_at` | TIMESTAMPTZ | Set when marked as read |

**RLS**: SELECT/UPDATE public (for user to read own + mark read). INSERT service_role only.
**Realtime**: Enabled via `ALTER PUBLICATION supabase_realtime ADD TABLE`.
**Index**: `idx_notifications_user_unread` on `(user_id, created_at DESC) WHERE is_read = false`.

#### `push_subscriptions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `user_id` | UUID FK | → `verified_users(id)` ON DELETE CASCADE |
| `endpoint` | TEXT UNIQUE | Push service endpoint URL |
| `p256dh` | TEXT | Encryption key |
| `auth` | TEXT | Auth secret |
| `user_agent` | TEXT | Browser user agent |
| `created_at` | TIMESTAMPTZ | Default now() |

**RLS**: ALL public (for client-side upsert).

#### `visit_stats`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK | Always `1` (single-row counter) |
| `count` | INT | Total visits |

**RLS**: SELECT public. UPDATE blocked (edge function increments via service_role).

#### `document_likes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `document_id` | TEXT | References client-side document ID |
| `user_phone` | TEXT | Phone of the liker |
| `created_at` | TIMESTAMPTZ | Default now() |

**Constraint**: UNIQUE(document_id, user_phone).
**RLS**: SELECT/INSERT/DELETE public.

#### `document_comments`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `document_id` | TEXT | References client-side document ID |
| `user_name` | TEXT | Commenter's name |
| `user_phone` | TEXT | Commenter's phone |
| `content` | TEXT | Comment text |
| `created_at` | TIMESTAMPTZ | Default now() |

**RLS**: SELECT/INSERT public. UPDATE/DELETE blocked.

#### `otp_verifications`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `reference` | TEXT UNIQUE | OTP reference |
| `phone` | TEXT | Target phone |
| `otp_code` | TEXT | The OTP code |
| `status` | TEXT | Default `'pending'` |
| Various metadata | TEXT | `qr_url`, `clickable_url`, `client_id`, `client_name`, `mobile` |
| `created_at` | TIMESTAMPTZ | Default now() |
| `verified_at` | TIMESTAMPTZ | When verified |

**RLS**: SELECT blocked. INSERT/UPDATE service_role only.

### View

#### `verified_users_lookup`
```sql
SELECT id, phone FROM verified_users;
```
Grants SELECT to anon/authenticated. Used to resolve `userId` from phone without exposing full verified_users table.

### Edge Functions

| Function | Auth | Purpose |
|----------|------|---------|
| `family-api/verify-passcode` | Public | Validates family passcode against `FAMILY_PASSCODE` env var |
| `family-api/track-visit` | Public | Increments `visit_stats.count` |
| `family-api/register-user` | Public | Upserts into `verified_users` during onboarding |
| `family-api/get-my-user-id` | Public | Returns `verified_users.id` by phone |
| `family-api/get-verified-ids` | Public | Returns list of verified `member_id`s (no PII) |
| `family-api/get-vapid-key` | Public | Returns `VAPID_PUBLIC_KEY` env var |
| `family-api/update-member` | Auth | Admin token OR self-edit (restricted to `birth_year`, `phone`) |
| `family-api/add-member` | Admin | Inserts new family member |
| `family-api/delete-member` | Admin | Deletes member (blocked if has children) |
| `family-api/archive-member` | Admin | Sets `is_archived = true` |
| `family-api/get-requests` | Admin | Returns all `family_requests` |
| `family-api/resolve-request` | Admin | Handles approve/reject: adds spouse, creates child, updates status |
| `family-api/mark-done` | Admin | Sets request status to `'completed'` |
| `family-api/get-verified-users` | Admin | Returns all verified users with PII |
| `family-api/delete-verified-user` | Admin | Deletes from `verified_users` |
| `family-api/send-notification` | Admin | Creates notification rows + triggers push via `send-push-notification` |
| `admin-auth` (login) | Public | Validates `ADMIN_PASSWORD` env var, creates session token |
| `admin-auth` (validate) | Public | Checks token against `admin_sessions` table |
| `seed-family-data` | Service | Bulk upserts from `_shared/family-data.ts` with topological sort |
| `send-push-notification` | Service | RFC 8291 Web Push: VAPID JWT + aes128gcm payload encryption |

### Environment Variables (edge functions)

| Variable | Used By | Purpose |
|----------|---------|---------|
| `SUPABASE_URL` | All | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | All | Service role key for bypassing RLS |
| `ADMIN_PASSWORD` | `admin-auth` | Admin login password |
| `FAMILY_PASSCODE` | `family-api` | Family registration passcode |
| `VAPID_PUBLIC_KEY` | `family-api`, `send-push-notification` | Web Push public key |
| `VAPID_PRIVATE_KEY` | `send-push-notification` | Web Push private key |
| `VITE_SUPABASE_URL` | Client | Supabase URL for client SDK |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Supabase anon key |

---

## AUTH

### User Auth (Custom, No Supabase Auth)

**Registration flow** (in `OnboardingModal.tsx`, 5 steps):

1. **Search**: User types name → `searchMembers()` finds matches → user selects their entry
2. **Passcode**: User enters 6-digit family passcode → `verifyFamilyPasscode()` validates server-side
3. **Phone**: User enters Saudi phone number (`05xxxxxxxx`)
4. **Birth date**: Optional Hijri date picker (year/month/day)
5. **Success**: `registerVerifiedUser()` upserts into `verified_users` table → user data saved to localStorage

**Login persistence**: `AuthContext` reads from `localStorage["khunaini-current-user"]` on mount. No token expiry for users — they stay logged in until they manually log out.

**CurrentUser interface** (stored in localStorage):
```typescript
{
  memberId: string;     // e.g. "M209_3"
  memberName: string;   // Full Arabic name
  phone: string;        // "05xxxxxxxx"
  hijriBirthDate?: string; // "1420/5/15"
  verifiedUserId?: string; // UUID from verified_users table
}
```

**Self-edit permissions**: Verified users can only update their own `birth_year` and `phone` via `family-api/update-member`. The edge function checks `requesterPhone` against `verified_users.phone` to confirm identity, and blocks all other fields.

### Admin Auth

1. Navigate to `/admin` → `AdminProtect` renders password form
2. Password submitted to `admin-auth` edge function → compared against `ADMIN_PASSWORD` env var
3. On success: `{ token: "uuid-timestamp", expiresAt: "ISO string" }` returned
4. Client stores `token` in `sessionStorage["khunaini-admin-token"]`, `expiresAt` in `sessionStorage["khunaini-admin-expiry"]`
5. On subsequent visits: `AdminProtect` checks local expiry first, then validates server-side via `admin-auth` with `action: "validate"`
6. Token expires after 2 hours. Logout clears sessionStorage.
7. All admin API calls send `x-admin-token` header → validated in edge function against `admin_sessions` table.

### localStorage Keys

| Key | Value | Set By |
|-----|-------|--------|
| `khunaini-current-user` | `CurrentUser` JSON | `AuthContext.login()` |
| `hasSeenOnboarding` | `"true"` | `AuthContext.login()` |
| `family-tree-theme` | `"light"` or `"dark"` | `ThemeContext` |
| `khunaini-active-tab` | `"map"`, `"navigate"`, `"branches"`, `"kinship"`, `"list"` | Index page |
| `my_requests` | JSON array of submitted requests | `SubmitRequestForm` |

### sessionStorage Keys

| Key | Value | Set By |
|-----|-------|--------|
| `khunaini-admin-token` | Admin session token string | `AdminProtect` |
| `khunaini-admin-expiry` | ISO date string (2h from login) | `AdminProtect` |
| `khunaini-visit-tracked` | `"true"` | `dataService.trackVisit()` |
| `chunk_reload` | `"1"` | `App.tsx:lazyRetry()` |

---

## DOMAIN LOGIC

### Branch Calculation

Every person belongs to one of three branches, determined by walking up the `father_id` chain to find which pillar ancestor (200, 300, or 400) they descend from.

```typescript
// src/utils/branchUtils.ts
export const PILLARS = [
  { id: "300", label: "فرع ناصر", name: "ناصر بن زيد" },
  { id: "400", label: "فرع عبدالعزيز", name: "عبدالعزيز بن زيد" },
  { id: "200", label: "فرع محمد", name: "محمد بن زيد" },
];

export function getBranch(personId: string): { pillarId: string; label: string } | null {
  let currentId = personId;
  while (currentId) {
    if (PILLAR_IDS.has(currentId)) {
      return { pillarId, label };
    }
    const member = getMemberById(currentId);
    currentId = member?.father_id;
  }
  return null;
}
```

The root of the tree is `100` (ناصر سعدون الخنيني). His son is `101` (زيد بن ناصر). Zeid's three sons form the pillars: `200` (محمد), `300` (ناصر), `400` (عبدالعزيز).

### Generation / Depth Calculation

```typescript
// src/services/familyService.ts
export function getDepth(id: string): number {
  let depth = 0;
  let current = memberMap.get(id);
  while (current?.father_id) {
    depth++;
    current = memberMap.get(current.father_id);
  }
  return depth;
}
```

Depth 0 = founder (100). Depth 1 = زيد (101). Depth 2 = pillars (200, 300, 400). Depth 3+ = descendants.

### ID Format and Meaning

- **Pure numeric** (`100`, `101`, `200`, `300`, `400`): Root/pillar members. Used for the founder and his immediate descendants.
- **Prefixed hierarchical** (`M203_1`, `M204_5_2`): Descendants within branches. Format: `{prefix}{fatherId}_{childSequence}`. The prefix `M` indicates a member added under a numeric-ID father. Nested children append `_{sequence}` recursively.
- **Generation logic** in `generateMemberId()`:
  - If father has a letter prefix → child inherits: `M204_5` → child becomes `M204_5_1`
  - If father is numeric → next available numeric ID (for admin-added roots)

### Kinship Calculation (LCA-based)

```typescript
export function findKinship(id1: string, id2: string) {
  const chain1 = getAncestorChain(id1); // [self, father, grandfather, ...]
  const chain2 = getAncestorChain(id2);
  // Find LCA (lowest common ancestor)
  for each ancestor in chain1:
    if ancestor in chain2:
      return { lca, dist1: steps from id1, dist2: steps from id2, paths }
}
```

The `kinshipToArabic(dist1, dist2, person1, person2)` function maps distance pairs to Arabic kinship terms:
- `(0,0)` = نفس الشخص (same person)
- `(0,1)` = أبوه/أبوها (father)
- `(1,1)` = أخوه الشقيق / أخوه من الأب (sibling, detects full vs half via mother name)
- `(2,2)` = ابن عمه (cousin)
- `(1,2)` = عمه (uncle)
- `(2,1)` = ابن أخيه (nephew)
- And so on up to distance 5+5, with gender-aware Arabic forms.

The `kinshipDirectional()` function provides bidirectional labels: what person1 is to person2 AND what person2 is to person1.

### Data Merge Strategy

In `src/services/familyService.ts:loadMembers()`:

1. Fetch all rows from `family_members` table via Supabase
2. Load verified member IDs in parallel
3. Build a `stripNulls` helper that removes null/undefined/empty string values from cloud data
4. Start with ALL static members as base
5. For each static member with a cloud counterpart: `{ ...staticMember, ...stripNulls(cloudMember) }`
6. Add any cloud-only members (not in static) — these are admin-added members
7. Filter out archived members (`is_archived = true`)
8. Rebuild lookup maps (`memberMap`, `childrenMap`)

**Why this strategy**: Static data is curated and complete. Cloud data may have nulls (e.g., a seed without notes). The merge ensures no data loss while allowing cloud updates to override specific fields.

### Privacy Rules

In `src/utils/privacyUtils.ts`:

```typescript
const AGE_EXEMPT_IDS = ['100', '101', '200', '300', '400', '500', '600'];
const SPOUSE_EXEMPT_IDS = ['100', '101', '200', '300', '400'];

// Guests see age/spouse info ONLY for these exempt ancestors
// Logged-in users see everything
```

For guests, private fields show a lock icon with `🔒 [field] -- خاص بأفراد العائلة`.

Spouse labels for grouped children: guests see `زوجة ١`, `زوجة ٢`; logged-in users see actual names.

---

## DESIGN SYSTEM

### CSS Variables (HSL format, in `src/index.css`)

**Light Mode** (`:root`):
```
--background: 38 30% 96%        (warm cream)
--foreground: 152 42% 13%       (deep green-black)
--primary: 152 42% 18%          (heritage green)
--primary-foreground: 38 28% 97%
--accent: 42 65% 50%            (heritage gold)
--accent-foreground: 152 42% 13%
--card: 38 28% 97%
--muted: 38 18% 92%
--destructive: 0 72% 51%
--border: 38 18% 85%
--radius: 0.75rem
--male: 200 55% 42%             (blue)
--female: 350 45% 52%           (pink)
--canvas-bg: 38 25% 94%
--canvas-dot: 152 20% 75%
```

**Dark Mode** (`.dark`):
```
--background: 150 15% 7%        (dark forest)
--foreground: 38 22% 90%        (warm white)
--primary: 42 55% 65%           (gold becomes primary)
--accent: 42 45% 42%            (muted gold)
--card: 150 12% 10%
--muted: 150 10% 14%
--male: 200 45% 55%
--female: 350 35% 55%
```

### Branch Colors

| Branch | Pillar ID | CSS Variable | Light BG | Light Text |
|--------|-----------|-------------|----------|------------|
| فرع محمد | `200` | `--pillar-3-*` | `hsl(45 70% 92%)` | `hsl(45 60% 35%)` |
| فرع ناصر | `300` | `--pillar-1-*` | `hsl(155 40% 90%)` | `hsl(155 45% 30%)` |
| فرع عبدالعزيز | `400` | `--pillar-2-*` | `hsl(25 50% 90%)` | `hsl(25 55% 35%)` |

### RTL / Arabic Rules

- **Global direction**: `<html dir="rtl">` — never override globally.
- **Component-level `dir="rtl"`**: Applied explicitly on navigation bars, sheets, modals for redundancy.
- **`dir="ltr"` exceptions**: Phone number inputs (`<Input dir="ltr">`), code-like fields.
- **Arrow icons**: `ChevronLeft` points backward (right in RTL context, used as "next" indicator).
- **`text-right`**: Used on text-heavy content; most Tailwind alignment respects RTL via logical properties.
- **Safe area insets**: `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)` used for iOS notch/home-bar.

### Glass Effect Pattern

Used throughout for headers, floating panels, and overlays:
```
bg-card/80 backdrop-blur-xl border-border/40 shadow-sm
```

Or for stronger effect:
```
bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.08)]
```

### Dark Mode Implementation

- `ThemeContext` manages `"light"` | `"dark"` state, persisted in `localStorage["family-tree-theme"]`.
- Toggling adds/removes `.dark` class on `<html>`.
- All colors use CSS variables, so dark mode is pure CSS — no JS re-renders.
- Default theme is `"light"`.

### Font System

```css
font-family: 'YearOfHandicrafts', 'Tajawal', sans-serif;
```

Five weights loaded (400, 500, 600, 700, 800) via `@font-face` with `font-display: block`. Body starts at `opacity: 0` and transitions to `opacity: 1` when `.fonts-loaded` is added after `document.fonts.ready`.

### Tatweel in Headings

Arabic text in headings and card names uses the tatweel (kashida) character `ـ` for visual elongation. The `applyTatweel()` function:
- Inserts `ـ` between connected Arabic letters
- Skips non-connecting letters (ا أ إ آ ى د ذ ر ز و ة)
- Exempts sacred words (الله, الرحمن, الرحيم)
- Only applies to words with 3+ characters

---

## KNOWN ISSUES

### Real Bugs

- **`useTreeLayout` performance**: Expanding all nodes on mobile causes significant lag. The `expandAll` function shows a `window.confirm()` warning but no progressive loading exists.
- **Chunk load failure**: `lazyRetry()` in `App.tsx` forces a page reload on chunk load failure (e.g., after deployment). Uses `sessionStorage["chunk_reload"]` to prevent infinite reload loops, but the UX is a full page flash.
- **`App.css` is unused**: Contains Vite boilerplate (`.logo`, `.card`, `.read-the-docs`) that serves no purpose but isn't causing harm.

### Technical Debt

- **`window.__toggleExpandNode` global**: `FamilyCard.tsx` communicates expand/collapse events through a window-level global function because React Flow node components can't easily access parent state. This works but is fragile.
- **Custom events for tab switching**: `LandingPage` dispatches custom DOM events (`switch-to-map`, `switch-to-kinship`, etc.) to communicate with `Index.tsx`. This bypasses React's data flow.
- **`family-api` monolith**: All 17+ actions are in one edge function. This makes the file long (~450 lines) but avoids cold-start overhead from multiple functions.
- **`familyData.ts` size**: The static data file is 22K+ tokens. It's imported at build time and included in the bundle. This is intentional for offline support but makes the initial bundle larger.
- **Hardcoded current Hijri year**: `src/utils/ageCalculator.ts` has `CURRENT_HIJRI_YEAR = 1447`. This must be manually updated each year.

### Intentional Workarounds

- **`phone: null` in `getMembers()`**: The `dataService.getMembers()` function explicitly sets `phone: null` in the returned data. Phone numbers are never sent to the client via the public SELECT query — they're only accessible through edge functions with proper auth. This is a privacy measure.
- **Synthetic request ID**: `submitRequest()` returns a `crypto.randomUUID()` as the request ID because RLS blocks SELECT on `family_requests`. The real server-generated UUID is never returned to the client.
- **Realtime retry with delay**: `useNotifications` resolves `userId` with up to 3 retries (3-second delays) because the `verified_users_lookup` view may not be immediately consistent after registration.

---

## CONVENTIONS

### Naming Rules

- **Files**: PascalCase for components (`FamilyCard.tsx`), camelCase for hooks (`useTreeLayout.ts`), camelCase for utils (`branchUtils.ts`), camelCase for services (`familyService.ts`).
- **Components**: PascalCase exports. Named exports preferred over default except for pages (which use `export default` for lazy loading).
- **Hooks**: `use` prefix. Admin hooks in `src/hooks/admin/`. Public hooks in `src/hooks/`.
- **CSS classes**: Tailwind utility-first. Custom classes in `src/index.css` only for things Tailwind can't express (font-face, view transitions, canvas dots).
- **Types**: Defined close to usage. Admin types in `src/types/admin.ts`. Family member type in `src/data/familyData.ts`. Per-component types are inline.

### Arabic Content Rules

- All user-facing strings are Arabic.
- Use Eastern Arabic (Indic) numerals for all displayed numbers: `٠١٢٣٤٥٦٧٨٩`.
- Conversion functions: `toArabicNum()` in `src/utils/arabicUtils.ts` and `src/utils/ageCalculator.ts`.
- Dates are always Hijri (e.g., `١٣٨٩/١٢/١٢`). Format: `year/month/day` or just `year`.
- The `toLocaleString("ar-SA")` is used for number formatting where appropriate.
- Arabic comma `،` is the separator for spouse names.
- Names follow Arabic patronymic convention: `عبدالله بن محمد` (Abdullah son of Muhammad), `نورة بنت زيد` (Noura daughter of Zeid).

### How to Add a New Page

1. Create component in `src/pages/NewPage.tsx` with `export default`
2. Add lazy import in `src/App.tsx`: `const NewPage = lazyRetry(() => import("./pages/NewPage.tsx"))`
3. Add route: `<Route path="/new-page" element={<Suspense fallback={<LoadingSpinner />}><NewPage /></Suspense>} />`
4. Follow existing page structure: `h-[100dvh]`, header with back button, `dir="rtl"`, safe area padding

### How to Add a New Admin Section

1. Add the section name to `AdminSection` type in `src/types/admin.ts`
2. Create component in `src/components/admin/new-section/NewSectionPage.tsx`
3. Add sidebar entry in `src/components/admin/AdminSidebar.tsx` (icon + label + section key)
4. Add bottom bar entry in `src/components/admin/AdminBottomBar.tsx`
5. Add conditional render in `src/pages/Admin.tsx`: `{section === "new-section" && <NewSectionPage />}`
6. Create hook in `src/hooks/admin/useNewSection.ts` with `getAdminToken()` for auth

### How to Add a New Edge Function Action

1. Add the action handler in `supabase/functions/family-api/index.ts` following the existing pattern:
   ```typescript
   if (path === "new-action" && req.method === "POST") {
     // If admin-only:
     if (!(await validateAdminToken(req, supabase))) {
       return json({ error: "Unauthorized" }, 401);
     }
     const { param } = await req.json();
     // ... logic with supabase admin client ...
     return json({ success: true });
   }
   ```
2. Add corresponding client function in `src/services/dataService.ts`:
   ```typescript
   export async function newAction(param: string, adminToken?: string) {
     const headers = adminToken ? { "x-admin-token": adminToken } : undefined;
     return callFamilyApi("new-action", { param }, headers);
   }
   ```
3. Use in hook or component.

### How to Add a New Hook

1. Create in `src/hooks/` (public) or `src/hooks/admin/` (admin).
2. Follow pattern: `useState` + `useEffect` for data loading, `useCallback` for actions, `useMemo` for derived state.
3. Admin hooks should use `getAdminToken()` from `AdminProtect.tsx`.
4. Return an object with `{ data, isLoading, refetch }` at minimum.
5. Listen for `"family-data-updated"` custom event if the hook depends on family data that could change.

### Build & Dev Commands

```bash
npm run dev         # Start dev server on port 8080
npm run build       # Production build
npm run build:dev   # Development build (with source maps)
npm run preview     # Preview production build
npm run test        # Run vitest tests
npm run test:watch  # Run vitest in watch mode
npm run lint        # ESLint
```

### Path Alias

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig`).

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@xyflow/react` | Interactive tree canvas (React Flow v12) |
| `d3-hierarchy` | Tree layout computation |
| `framer-motion` | Animations and transitions |
| `@supabase/supabase-js` | Supabase client |
| `@tanstack/react-query` | Query client (present but lightly used) |
| `sonner` | Toast notifications |
| `lucide-react` | Icons |
| `jspdf` | PDF generation for lineage cards |
| `vite-plugin-pwa` | PWA with injectManifest strategy |
| `zod` | Schema validation |
| `react-day-picker` | Calendar component (used by shadcn) |
| `cmdk` | Command palette (used by shadcn command) |
| `recharts` | Dashboard charts |

## 🚫 WHAT NOT TO DO (LEARNED THE HARD WAY)
- Don't touch familyData.ts structure — even "minor refactors" break the merge logic
- Don't add Supabase Auth — the whole auth system is custom by design
- Don't change ID formats — existing database rows will orphan
- Don't switch PWA to generateSW — injectManifest is required for custom push logic