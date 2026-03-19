

# Fix seed-family-data Topological Sort

## Analysis
The existing topological sort logic is functionally correct, but the **batching** is the real culprit. When 50 members are upserted in a single statement, a child and its father can land in the same batch. Postgres processes the upsert as one operation, so if the father row doesn't exist yet (being inserted in the same batch), the FK check fails — even though the sort order is correct.

## Fix (single file: `supabase/functions/seed-family-data/index.ts`)

1. **Replace the sort logic** with the user's cleaner `topoSort()` function (lines 31–47)
2. **Reduce batch size from 50 → 1** (sequential inserts) to guarantee parent exists before child — OR keep batches but ensure no batch contains a child whose father is in the same batch

The simplest reliable fix: insert **one by one** in topological order. With 475 members this is still fast (~2-3 seconds).

### Changes
- Lines 31–47: Replace inline sort with the standalone `topoSort()` function
- Lines 49–76: Change batch upsert to single-row upserts in a loop, collecting errors per member

```text
Before:  batch of 50 → some fathers + children in same batch → FK failure
After:   one-by-one in topo order → father always exists first → 0 failures
```

