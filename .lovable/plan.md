

# Fix Sync to Use Static Data Source

## Problem
`handleSync` calls `getAllMembers()` which returns cloud-cached data (391 members) instead of the static file (477 members).

## Fix — `src/pages/Admin.tsx`

1. Add import: `import { familyMembers } from '@/data/familyData';`
2. In `handleSync`, replace `const members = getAllMembers();` with `const members = familyMembers;`

That's it. One import, one line change.

