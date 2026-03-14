

# Critical Security Fixes — Implementation Plan

## Impact Analysis

After locking down RLS, several client-side queries break because they currently read from tables that will be blocked. Here's the dependency chain:

- `getRequests()` → reads `family_requests` (blocked after Fix 3)
- `getVerifiedUsers()` → reads `verified_users` (blocked after Fix 2)
- `loadVerifiedMemberIds()` → reads `verified_users.member_id` (blocked after Fix 2)
- Admin realtime subscription on `family_requests` → stops working
- `getVisitCount()` → reads `visit_stats` (still allowed — public read kept)

These must be routed through edge functions using service_role.

---

## Changes (in order)

### 1. Database Migration — RLS lockdown (all tables)

Single migration file covering all 6 tables. Drops all existing permissive policies, creates new restrictive ones per the user's spec. Key points:
- `family_members`: SELECT allowed, INSERT/UPDATE/DELETE blocked for anon+authenticated
- `verified_users`: all operations blocked for anon+authenticated
- `family_requests`: INSERT allowed, SELECT/UPDATE blocked
- `visit_stats`: SELECT allowed, UPDATE blocked
- `document_likes`/`document_comments`: SELECT+INSERT allowed, UPDATE/DELETE blocked
- New `admin_sessions` table with no client access

### 2. Edge Function — `admin-auth/index.ts` (new)

- Accepts `{ password }`, validates against `ADMIN_PASSWORD` secret
- Generates UUID token, stores in `admin_sessions` table with 2h expiry
- Also supports `{ action: "validate", token }` to verify existing session
- Returns `{ token, expiresAt }` on success

### 3. Edge Function — `family-api/index.ts` (updated)

New endpoints added:
- `verify-passcode` — validates against `FAMILY_PASSCODE` secret
- `get-requests` — requires admin token validation → returns all requests
- `get-verified-users` — requires admin token validation → returns all verified users
- `get-verified-ids` — public, returns only `member_id` array (no PII)

Admin token validation helper: reads token from request header, checks `admin_sessions` table for valid unexpired session.

### 4. `AdminProtect.tsx` — rewrite

- Remove hardcoded passwords and localStorage
- Use `sessionStorage` for admin token (expires with tab)
- On mount: validate existing token via edge function
- On login: call `admin-auth` edge function
- Add loading state during validation

### 5. `OnboardingModal.tsx` — passcode server-side

- Remove `FAMILY_PASSCODE` constant (line 24)
- Replace inline comparison (`familyPasscode === FAMILY_PASSCODE`) with async call to `family-api/verify-passcode`
- Add loading spinner during verification

### 6. `dataService.ts` — multiple fixes

- **Phone exclusion**: Change `.select("*")` to `.select("id, name, gender, father_id, birth_year, death_year, spouses, notes")` in `getMembers()`
- **Visit dedup**: Add `sessionStorage` check at top of `trackVisit()`
- **`getRequests()`**: Route through edge function with admin token header
- **`getVerifiedUsers()`**: Route through edge function with admin token header
- **`loadVerifiedMemberIds()`**: Route through edge function `get-verified-ids` (no auth needed, returns IDs only)

### 7. `Admin.tsx` — adapt to new data flow

- Pass admin token to `getRequests()` and `getVerifiedUsers()` calls
- Remove or replace the realtime subscription on `family_requests` (it will fail since SELECT is blocked). Replace with polling every 30s, or remove and keep manual refresh button.

### 8. Secrets to add

- `ADMIN_PASSWORD` — edge function secret (value from current hardcoded passwords)
- `FAMILY_PASSCODE` — edge function secret (value: `339921`)

### 9. `supabase/config.toml` update

Add `[functions.admin-auth]` with `verify_jwt = false`.

---

## Files Changed Summary

| File | Action |
|------|--------|
| `supabase/migrations/TIMESTAMP_security_rls_lockdown.sql` | Create |
| `supabase/functions/admin-auth/index.ts` | Create |
| `supabase/functions/family-api/index.ts` | Edit (add 4 endpoints + admin validation) |
| `src/components/AdminProtect.tsx` | Rewrite |
| `src/components/OnboardingModal.tsx` | Edit (remove hardcoded passcode, async verify) |
| `src/services/dataService.ts` | Edit (phone exclusion, visit dedup, route admin reads through edge functions) |
| `src/pages/Admin.tsx` | Edit (adapt to new data flow, replace realtime with polling) |

## What stays working

- Public tree browsing (family_members SELECT still open)
- Onboarding flow (passcode validated server-side, registration via edge function)
- Visit counter display (visit_stats SELECT still open)
- Document likes/comments (INSERT+SELECT still open)
- Admin panel (now properly authenticated server-side)

