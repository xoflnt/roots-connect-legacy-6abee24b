

# Add 3rd & 4th Generation Family Members

## Change
Single file update: **`src/data/familyData.ts`** — replace the existing 6-member array with the provided 19-member array.

No UI or layout changes needed. The dagre layout and React Flow will automatically handle the new nodes since they read from the same `familyMembers` array.

## Data Structure
- Gen 1: id 1 (root)
- Gen 2: ids 2–6 (children of 1)
- Gen 3: ids 7–8 (children of 2), 13–15 (children of 4), 16–19 (children of 3)
- Gen 4: ids 9–11 (children of 8), 12 (child of 11)

All fields match the existing `FamilyMember` interface. Missing `notes` fields will be added as empty strings.

