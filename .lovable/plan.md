

# Phase 2A: Member Detail Sheet

## Files to Create (1)

### `src/components/admin/members/MemberDetailSheet.tsx`
A Sheet component showing full member details when a MemberCard is tapped.

- **Props**: `member: EnrichedMember | null`, `allMembers: EnrichedMember[]`, `isOpen: boolean`, `onClose: () => void`
- **Sheet side**: `bottom` (mobile viewport detected via `useIsMobile()`) / `right` (desktop, visually left in RTL)
- **Content** (scrollable, `dir="rtl"`):
  - **Header**: Name (22px+ bold), lineage chain ("بن father بن grandfather" resolved from allMembers), branch colored badge, generation text, deceased indicator
  - **Info section** ("المعلومات الأساسية"): ID (monospace), gender, birth year, death year (if deceased), notes (if exists)
  - **Family section** ("العائلة"): Father (tappable → opens that member's detail), mother (extracted from notes via regex for "والدته:" or "والدتها:"), spouses list
  - **Children section** ("الأبناء"): Filter `allMembers` by `father_id === member.id`, group sons/daughters, show counts with `toArabicNum()`, each child as tappable chip that sets the sheet to show that child
  - **Sticky actions bar**: 3 buttons — "تعديل" (placeholder), "أرشفة" (placeholder), "مشاركة" (WhatsApp share via `wa.me`)

Internal state: `viewingMember` to allow navigating to father/child within the same sheet without closing it.

## Files to Modify (2)

### `src/components/admin/members/MemberCard.tsx`
- Add `onTap: (member: EnrichedMember) => void` prop
- Wrap the main content area (excluding ⋮ button) in a tappable `button` or add `onClick` to the outer div, calling `onTap(member)`
- Add `cursor-pointer` and hover state

### `src/components/admin/members/MemberListPage.tsx`
- Add `selectedMember` state (`EnrichedMember | null`)
- Destructure `allMembers` from `useMembers()`
- Pass `onTap={setSelectedMember}` to each `MemberCard`
- Render `<MemberDetailSheet>` at the bottom with `member={selectedMember}`, `allMembers`, `isOpen={!!selectedMember}`, `onClose={() => setSelectedMember(null)}`

## Technical Notes
- All numbers via `toArabicNum()`
- `dir="rtl"`, logical margins (`ms-*`/`me-*`)
- Min font 16px, min tap 48px
- Sheet scrollable via `overflow-y-auto` with max height
- Grandfather resolved by: `allMembers.find(m => m.id === member.father_id)?.fatherName`

