

# Fix Merge Logic in familyService.ts

## Problem
`loadMembers()` (line 34-35) replaces all data with cloud-only data: `buildMaps(cloudMembers)`. Since cloud has 410 members but static has 477, 67 members are lost.

## Fix — `src/services/familyService.ts`, lines 28-46

Replace `loadMembers()` with proper merge logic:
- Start with all 477 static members as base
- Override with cloud data where IDs match
- Append any cloud-only members
- Result: always ≥ 477 members

```typescript
export async function loadMembers(): Promise<void> {
  try {
    const [cloudMembers] = await Promise.all([
      getMembers(),
      loadVerifiedMemberIds(),
    ]);
    if (cloudMembers.length > 0) {
      const staticMap = new Map(staticMembers.map(m => [m.id, m]));
      const cloudMap = new Map(cloudMembers.map(m => [m.id, m]));
      const merged: FamilyMember[] = staticMembers.map(m =>
        cloudMap.has(m.id) ? { ...m, ...cloudMap.get(m.id)! } : m
      );
      cloudMembers.forEach(m => {
        if (!staticMap.has(m.id)) merged.push(m);
      });
      buildMaps(merged);
      initialized = true;
    } else if (!initialized) {
      buildMaps([...staticMembers]);
    }
  } catch (e) {
    console.error("[familyService] loadMembers error, using static fallback:", e);
    if (!initialized) {
      buildMaps([...staticMembers]);
    }
  }
}
```

Single file change, lines 28-46.

