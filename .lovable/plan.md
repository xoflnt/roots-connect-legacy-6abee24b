

# Delete Test Member from Database

## Finding
Found the test member:
- **ID**: `601`
- **Name**: خالد
- **Father**: علي بن محمد (id: 209)
- **Children**: None (safe to delete)

## Action Required
Run this SQL via a database migration:

```sql
DELETE FROM family_members WHERE id = '601';
```

This will remove the single test member "خالد" (id=601) that was added under "علي بن محمد". No children depend on this record.

## Verification
After deletion, confirm with:
```sql
SELECT id, name, father_id FROM family_members WHERE id = '601';
```
Expected result: 0 rows.

