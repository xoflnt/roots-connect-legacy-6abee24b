

# Fix: Use `inferMotherName` for sibling check

## Change

**File:** `src/services/familyService.ts`

Two lines changed in `kinshipToArabic()` at the sibling check (lines 232-233):

```
- const mother1 = person1 ? extractMotherName(person1) : null;
- const mother2 = person2 ? extractMotherName(person2) : null;
+ const mother1 = person1 ? inferMotherName(person1) : null;
+ const mother2 = person2 ? inferMotherName(person2) : null;
```

Additionally, the same pattern exists in `kinshipDirectional()` at lines 294-295 — this should also be updated to stay consistent:

```
- const mother1 = person1 ? extractMotherName(person1) : null;
- const mother2 = person2 ? extractMotherName(person2) : null;
+ const mother1 = person1 ? inferMotherName(person1) : null;
+ const mother2 = person2 ? inferMotherName(person2) : null;
```

**Why:** When siblings have no `notes` field, `extractMotherName` returns `null`. `inferMotherName` falls back to checking the father's spouse list — if there's only one spouse, it infers her as the mother, correctly identifying full siblings.

No other files changed.

