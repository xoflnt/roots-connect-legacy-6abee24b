

# Replace Family Data with Verified Dataset

## Single Change
**`src/data/familyData.ts`** — Replace the entire `familyMembers` array with the new 27-member dataset spanning 4 generations.

The `FamilyMember` interface fields `birth_year`, `death_year`, `spouses`, and `notes` need to remain as required `string` fields, so all missing fields in the provided JSON will default to `""`.

The new ID scheme uses semantic numbering (100s for gen 1, 200s/300s for gen 2-3 branches). No UI changes needed — the FamilyCard already shows only name + years.

