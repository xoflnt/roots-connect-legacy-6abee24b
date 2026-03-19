

# Replace seed-family-data Edge Function

## What needs to happen

Two files need to be created/modified:

### 1. Create `supabase/functions/_shared/family-data.ts`
Edge functions cannot import from `src/`. The static data must be duplicated into the edge functions shared directory. This file will export the same `familyMembers` array from `src/data/familyData.ts` (all 489 lines).

### 2. Replace `supabase/functions/seed-family-data/index.ts`
Replace entirely with the user-provided code, which includes:
- **Kahn's topological sort** (BFS-based) instead of recursive DFS — more robust for large trees
- **Orphan cleaning** — nullifies `father_id` references that point outside the dataset
- **Batch upsert with fallback** — tries batches of 50, falls back to one-by-one on failure
- **Two-pass strategy** — retries failed members from pass 1 individually in pass 2
- **Full diagnostics** — returns orphan count, sort stats, and per-member error details

### Important note
The import `import { familyMembers } from "../_shared/family-data.ts";` is correct for Deno edge functions — relative path from `seed-family-data/` to `_shared/`.

### CORS consideration
The user's provided code does **not** include CORS headers or OPTIONS handling. The current code has them. Since Admin.tsx calls this via `supabase.functions.invoke()`, CORS headers are needed. I will add the standard CORS headers and OPTIONS handler to the provided code.

### Files changed
| File | Action |
|------|--------|
| `supabase/functions/_shared/family-data.ts` | **Create** — copy of static data |
| `supabase/functions/seed-family-data/index.ts` | **Replace** — new implementation |

