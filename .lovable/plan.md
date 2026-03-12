

# Pivot to Centralized Cloud Database

## The Problem
All shared data (family members, requests, verified users, visit counts) is stored in `localStorage`, making it invisible across devices/users. The Admin can never see requests submitted by others.

## The Solution
Migrate three shared data entities to Lovable Cloud database tables, keeping `localStorage` only for device-local preferences (theme, font size, user session).

---

## Step 1 — Create Database Tables (Migration)

**A. `family_members`** — Seed with `familyData.ts` static data + support dynamic overrides:
```sql
CREATE TABLE public.family_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M','F')),
  father_id TEXT REFERENCES public.family_members(id),
  birth_year TEXT,
  death_year TEXT,
  spouses TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.family_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service write" ON public.family_members FOR ALL TO service_role USING (true);
```

**B. `family_requests`**:
```sql
CREATE TABLE public.family_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  target_member_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.family_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.family_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert" ON public.family_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Service update" ON public.family_requests FOR UPDATE TO service_role USING (true);
```

**C. `verified_users`**:
```sql
CREATE TABLE public.verified_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL UNIQUE,
  member_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  hijri_birth_date TEXT,
  verified_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.verified_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.verified_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service write" ON public.verified_users FOR ALL TO service_role USING (true);
```

**D. `visit_stats`** (single-row counter):
```sql
CREATE TABLE public.visit_stats (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  count INT NOT NULL DEFAULT 0
);
ALTER TABLE public.visit_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.visit_stats FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.visit_stats (id, count) VALUES (1, 0);
```

## Step 2 — Edge Function: `family-api`

A single edge function to handle admin mutations (approve/reject requests, update members) since RLS restricts writes to `service_role`:

- `POST /approve` — Updates request status, applies change to `family_members`
- `POST /reject` — Updates request status
- `POST /track-visit` — Increments visit counter
- `POST /register-user` — Upserts verified user

## Step 3 — Rewrite `dataService.ts`

Replace all `localStorage` calls with Supabase client queries:

| Function | Before | After |
|---|---|---|
| `getMembers()` | localStorage + static merge | `supabase.from('family_members').select('*')` |
| `updateMember()` | localStorage override | Edge function call |
| `addMember()` | localStorage array push | Edge function call |
| `submitRequest()` | localStorage save | `supabase.from('family_requests').insert(...)` |
| `getRequests()` | localStorage load | `supabase.from('family_requests').select('*')` |
| `approveRequest()` | localStorage | Edge function `/approve` |
| `rejectRequest()` | localStorage | Edge function `/reject` |
| `registerVerifiedUser()` | localStorage | Edge function `/register-user` |
| `getVerifiedUsers()` | localStorage | `supabase.from('verified_users').select('*')` |
| `trackVisit()` | localStorage counter | Edge function `/track-visit` |
| `getVisitCount()` | localStorage | `supabase.from('visit_stats').select('count')` |

## Step 4 — Rewrite `familyService.ts`

Change `buildMaps()` to accept data passed in (no more localStorage reads). Add an async `loadAndBuildMaps()` that fetches from Supabase, then builds the in-memory maps. Expose a `refreshMembers()` that re-fetches.

## Step 5 — Seed Data

Create a one-time Edge Function `seed-family-data` that reads the static `familyData.ts` array and bulk-inserts into `family_members`. After seeding, the static file becomes a reference only.

## Step 6 — Update Consumers

- **`Admin.tsx`** — Already calls `getRequests()`, `getVerifiedUsers()`, `getVisitCount()` — just needs the async versions. Also `approveRequest`/`rejectRequest` already async.
- **`Profile.tsx`** — Calls `updateMember()`, `addMember()` — already async, just needs the new implementation.
- **`OnboardingModal.tsx`** — Calls `registerVerifiedUser()`, `updateMember()` — already async.
- **`SubmitRequestForm.tsx`** — Calls `submitRequest()` — already async.
- **`FamilyTree.tsx`** — Uses `familyService.getAllMembers()`. Needs to await initial load.
- **Index.tsx / LandingPage** — Needs async member loading for stats.

## Step 7 — localStorage Audit

**KEEP** in localStorage (device-local only):
- `khunaini-current-user` (AuthContext session)
- `family-tree-theme` (ThemeContext)
- `font-size-level` (FontSizeContext)
- `hasSeenOnboarding`
- `khunaini-admin-auth`

**REMOVE** from localStorage:
- `khunaini-requests`
- `khunaini-verified-users`
- `khunaini-visits`
- `khunaini-member-overrides`
- `khunaini-added-members`
- `khunaini-member-additions`

## Files Changed

| File | Action |
|---|---|
| Migration SQL | Create 4 tables |
| `supabase/functions/family-api/index.ts` | New edge function |
| `supabase/functions/seed-family-data/index.ts` | New one-time seeder |
| `supabase/config.toml` | Add function config |
| `src/services/dataService.ts` | Full rewrite → Supabase |
| `src/services/familyService.ts` | Async data loading |
| `src/pages/Admin.tsx` | Minor async adjustments |
| `src/pages/Profile.tsx` | Minor async adjustments |
| `src/components/OnboardingModal.tsx` | No change (already async) |
| `src/components/FamilyTree.tsx` | Async initial load |
| `src/components/LandingPage.tsx` | Async member count |
| `src/pages/Index.tsx` | Async data init |

