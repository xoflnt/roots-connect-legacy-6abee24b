

# Fix Privacy Gaps in ListView.tsx

## Changes

### 1. Add imports (line 1-11)
- Add `useAuth` from `@/contexts/AuthContext`
- Add `canSeeAge`, `canSeeMotherName`, `privateLabel`, `getSpouseLabel` from `@/utils/privacyUtils`

### 2. ListView component — get `isLoggedIn` and pass to ListNode
- Add `const { isLoggedIn } = useAuth();` at top of `ListView`
- Pass `isLoggedIn` prop to each `<ListNode>`

### 3. ListNode — accept `isLoggedIn` prop
- Add `isLoggedIn: boolean` to `ListNodeProps` interface and destructure

### 4. Fix mother name pill (lines 237-243)
- Wrap with `canSeeMotherName(member.id, isLoggedIn)` check
- When hidden: show `privateLabel('الوالدة')` in italic muted style

### 5. Fix birth/death years (lines 245-250)
- Wrap with `canSeeAge(member.id, isLoggedIn)` — skip entirely when hidden

### 6. Fix age text (lines 252-254)
- When `canSeeAge` is false: show `privateLabel('العمر')` in italic muted style
- When true: show `ageText` as normal

### 7. Fix children group headers (lines 335-340)
- Use `getSpouseLabel(motherKey, group.colorIndex, isLoggedIn)` to mask mother name for guests
- Show "أبناء زوجة ١" etc. instead of real name

### 8. Pass `isLoggedIn` to recursive `<ListNode>` calls (line 344-352)

**Single file modified**: `src/components/ListView.tsx`

