

# Add Archive Functionality

## Overview
Add `is_archived` and `archived_at` columns to `family_members`, implement an `archive-member` edge function endpoint, enable the archive button in the UI, and filter archived members from public views.

## Step 1: Database Migration
```sql
ALTER TABLE family_members 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
```

## Step 2: Edge Function — `archive-member` endpoint
**File: `supabase/functions/family-api/index.ts`**
- Add new route `archive-member` (admin-only, validated via `validateAdminToken`)
- Accepts `{ memberId }` in body
- Updates `family_members` set `is_archived = true, archived_at = now()` where `id = memberId`
- Returns `{ success: true }`

## Step 3: Enable Archive Button in UI
**File: `src/components/admin/members/ArchiveDeleteDialog.tsx`**
- Add `archiving` state
- Replace placeholder text and disabled button with working `handleArchive` function
- Calls edge function `family-api/archive-member` with admin token header
- Shows loading state on button, toast on success/failure
- Calls `onSuccess()` + `onClose()` on success

## Step 4: Filter Archived Members
**File: `src/services/dataService.ts`**
- Add `is_archived` to the select columns in `getMembers()`
- Include `is_archived` in the mapped return object

**File: `src/services/familyService.ts`**
- In `loadMembers()`, after merging, filter out members where `is_archived === true`

**File: `src/data/familyData.ts`**
- Add `is_archived?: boolean` to `FamilyMember` interface

## Files Changed
- `supabase/functions/family-api/index.ts` — new endpoint
- `src/components/admin/members/ArchiveDeleteDialog.tsx` — enable archive button
- `src/services/dataService.ts` — fetch `is_archived` column
- `src/services/familyService.ts` — filter archived members
- `src/data/familyData.ts` — type update
- Database migration for new columns

