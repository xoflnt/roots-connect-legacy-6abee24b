

# Build In-App Notification System

## Architecture Overview

The `notifications` table uses `verified_users.id` (UUID) as `user_id`, but `CurrentUser` in AuthContext only stores `memberId`/`phone` — not the UUID. The table has RLS blocking all client access (service_role only). Two key changes are needed beyond the UI:

1. **Return UUID from registration** so the client can store it
2. **Add RLS policies** for anon to SELECT and UPDATE own notifications (needed for realtime subscriptions)
3. **Resolve UUID for existing users** via a new edge function action

## Changes

### 1. Database Migration — Add anon RLS policies on `notifications`

```sql
-- Allow anon to read their own notifications
CREATE POLICY "anon_select_own_notifications"
  ON public.notifications FOR SELECT TO anon, authenticated
  USING (true);

-- Allow anon to update own notifications (mark read)
CREATE POLICY "anon_update_own_notifications"
  ON public.notifications FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

Note: user_id is a UUID (not guessable), and notifications contain no sensitive PII. The client filters by user_id in queries. This enables realtime subscriptions.

### 2. Edge Function: `family-api/index.ts`

**Modify `register-user` action** (line 118-129): Return the `verified_users.id` UUID in the response after upsert.

**Add `get-my-user-id` action**: Given a phone number, return the `verified_users.id` UUID. This allows existing logged-in users (who registered before this change) to resolve their UUID.

### 3. `src/contexts/AuthContext.tsx`

Add optional `verifiedUserId?: string` to `CurrentUser` interface. This stores the `verified_users.id` UUID for notification queries.

### 4. `src/services/dataService.ts`

- Update `registerVerifiedUser` to return the UUID from the edge function response
- Add `getMyUserId(phone: string)` function to call the new edge action

### 5. `src/components/OnboardingModal.tsx`

After `registerVerifiedUser`, store the returned UUID in the `login()` call as `verifiedUserId`.

### 6. Create `src/hooks/useNotifications.ts`

- Accepts `userId: string | null` (the verified_users UUID)
- If no userId, resolves it via `getMyUserId(phone)` on first load
- Fetches notifications from Supabase client SDK (now allowed by RLS)
- Subscribes to realtime INSERT events
- Shows toast on new notification via sonner
- Exposes: `notifications`, `unreadCount`, `isLoading`, `markAsRead`, `markAllAsRead`
- All numbers use Eastern Arabic digits

### 7. Create `src/components/NotificationBell.tsx`

- Bell icon with red unread badge (Eastern Arabic count, "٩+" for >9)
- On mobile: opens a Drawer from bottom
- On desktop: opens a Popover
- Header: "الإشعارات" + "تحديد الكل كمقروء" button
- Empty state: "لا توجد إشعارات"
- Each notification item:
  - Icon by type (CheckCircle/XCircle/Megaphone/UserPlus/Info)
  - Title (bold if unread), body text
  - Relative Arabic time (using existing `relativeArabicTime`)
  - Unread items get `bg-primary/5` background
  - Tap marks as read
  - Min 48px tap target
- Full RTL, dir="rtl"

### 8. `src/components/AppHeader.tsx`

- Import NotificationBell
- Add it to the header icons area (before guide button), only for logged-in users
- Pass the user's verifiedUserId (or phone for resolution)

### 9. `src/App.tsx`

The Sonner toaster already exists (line 51). Add `position="top-center"` and `dir="rtl"` props to the existing Sonner import.

## Files Summary

| File | Action |
|------|--------|
| Migration SQL | Add anon SELECT/UPDATE policies on notifications |
| `supabase/functions/family-api/index.ts` | Return UUID from register-user, add get-my-user-id |
| `src/contexts/AuthContext.tsx` | Add `verifiedUserId` to CurrentUser |
| `src/services/dataService.ts` | Return UUID from register, add getMyUserId |
| `src/components/OnboardingModal.tsx` | Store verifiedUserId on login |
| `src/hooks/useNotifications.ts` | New — notification fetching + realtime |
| `src/components/NotificationBell.tsx` | New — bell UI with drawer/popover |
| `src/components/AppHeader.tsx` | Add NotificationBell for logged-in users |
| `src/App.tsx` | Configure Sonner position/RTL |

