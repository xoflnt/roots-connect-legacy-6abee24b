

# Add 19 Missing Members to familyData.ts

## Plan

Insert 19 new family members at 4 locations in `src/data/familyData.ts`, each group placed after the last existing sibling with the same `father_id`:

### Insertion 1 — After line 307 (after N9_1_2_4)
6 daughters of N9_1_2 (صالح بن سليمان): N9_1_2_5 through N9_1_2_10

### Insertion 2 — After line 332 (after N9_4_10_2)
1 daughter of N9_4_10 (عمر بن أحمد): N9_4_10_3

### Insertion 3 — After line 334 (after N9_4_11_1)
6 children of N9_4_11 (أسامة بن أحمد): N9_4_11_2 through N9_4_11_7

### Insertion 4 — After line 346 (after N9_4_19_2)
6 children of N9_4_19 (ياسر بن أحمد): N9_4_19_3 through N9_4_19_8

**Single file change**: `src/data/familyData.ts`  
**No existing data modified** — insertions only.

