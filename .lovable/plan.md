

# Create Restricted View & Update userId Resolution

## Changes

### 1. Database migration — Create `verified_users_lookup` view

```sql
CREATE VIEW public.verified_users_lookup
WITH (security_invoker=on) AS
  SELECT id, phone FROM public.verified_users;
```

The view inherits RLS from the base table (`security_invoker=on`). Since the base table has `block_all_select_verified_users` with `USING (false)`, we also need a SELECT policy that allows reading through the view. We'll add a permissive SELECT policy scoped to only `verified_users` for this purpose:

```sql
CREATE POLICY "anon_select_for_lookup"
  ON public.verified_users
  FOR SELECT TO anon, authenticated
  USING (true);
```

**Note**: With `security_invoker=on`, the view executes queries as the calling user (anon). The existing `block_all_select_verified_users` policy uses `USING (false)` — but since PostgreSQL OR's all permissive policies, adding this new `USING (true)` policy will allow SELECTs. However, this means the base table is also readable directly (not just via the view). Since the view only exposes `id` and `phone`, but direct queries to the base table would expose all columns including `member_name`, we need a different approach.

**Better approach**: Instead of a `security_invoker` view, use a `SECURITY DEFINER` function that returns only `id` for a given phone — this keeps the base table locked while providing a safe lookup path. But the user specifically asked for the view approach.

**Simplest safe approach**: Create the view WITHOUT `security_invoker` (defaults to `security_definer` behavior in older PG, but Supabase uses `security_invoker` by default). Actually, let's just skip the RLS complication — create the view as a regular view (without `security_invoker`), grant SELECT on it to anon. The base table stays locked.

Actually, views in Supabase without `security_invoker=on` run as the view owner (typically `postgres`/superuser), which bypasses RLS on the base table. This is the correct pattern here:

```sql
CREATE VIEW public.verified_users_lookup AS
  SELECT id, phone FROM public.verified_users;

GRANT SELECT ON public.verified_users_lookup TO anon, authenticated;
```

This way: the view bypasses RLS (runs as owner), only exposes `id` + `phone`, and the base table remains locked.

### 2. `src/hooks/useNotifications.ts` — Add direct client query as primary resolution

Replace `getMyUserId()` edge function call with a direct Supabase query to `verified_users_lookup`:

```typescript
const { data } = await supabase
  .from("verified_users_lookup" as any)
  .select("id")
  .eq("phone", currentUser.phone)
  .maybeSingle();

const id = data?.id || null;
```

Keep the edge function as a fallback if the view query fails. Remove the `getMyUserId` import if no longer needed.

### Files
| File | Change |
|------|--------|
| Migration SQL | Create `verified_users_lookup` view + GRANT |
| `src/hooks/useNotifications.ts` | Use view query instead of edge function |

