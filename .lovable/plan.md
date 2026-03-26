

# Build Admin Notifications Section

## Overview
Add a "Notifications" section to the admin panel for sending broadcast/targeted notifications, with history view. Requires a new edge function action, a hook, a page component, and navigation updates.

## Changes

### 1. `src/types/admin.ts` — Add `'notifications'` to `AdminSection` type

### 2. `supabase/functions/family-api/index.ts` — Add `send-notification` endpoint
Insert before the final `"Invalid endpoint"` return (line 387). Admin-only, validates token. Accepts `title`, `body`, `type`, `user_ids`. If no `user_ids`, fetches all `verified_users` and inserts one notification row per user.

### 3. Create `src/hooks/admin/useAdminNotifications.ts`
- `sendNotification({ title, body, type, user_ids })` — calls `family-api/send-notification` with admin token from `sessionStorage("khunaini-admin-token")`
- Loads recent broadcast history from `notifications` table (deduplicated by title+timestamp)
- Returns `{ sendNotification, isSending, history, isLoading }`

### 4. Create `src/components/admin/notifications/NotificationsPage.tsx`
RTL admin page with:
- **Send form**: title input, body textarea, type select (broadcast/info/new_member), recipient radio (all vs specific user with search), send button with loading state
- **History**: list of past broadcasts with title, body (truncated), relative Arabic time, type badge
- Uses `useAdminNotifications()` hook
- Consistent styling with existing admin pages (RequestsPage pattern)

### 5. `src/pages/Admin.tsx` — Add notifications route
Import `NotificationsPage`, add `{section === 'notifications' && <NotificationsPage />}`

### 6. `src/components/admin/AdminSidebar.tsx` — Add nav item
Add `{ id: 'notifications', label: 'الإشعارات', icon: Bell }` to `NAV_ITEMS`

### 7. `src/components/admin/AdminBottomBar.tsx` — Add tab
Add `{ id: 'notifications', label: 'الإشعارات', icon: Bell }` to `MAIN_TABS`

## Files Summary
| File | Action |
|------|--------|
| `src/types/admin.ts` | Add `'notifications'` to union |
| `supabase/functions/family-api/index.ts` | Add `send-notification` endpoint |
| `src/hooks/admin/useAdminNotifications.ts` | Create — send + history |
| `src/components/admin/notifications/NotificationsPage.tsx` | Create — admin UI |
| `src/pages/Admin.tsx` | Add route |
| `src/components/admin/AdminSidebar.tsx` | Add nav item |
| `src/components/admin/AdminBottomBar.tsx` | Add tab |

