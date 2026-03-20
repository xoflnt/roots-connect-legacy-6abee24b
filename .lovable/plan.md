

# Redesign Request System End-to-End

## Overview
Replace the single free-text request form with a multi-type, multi-step form; add user-facing request history in Profile; enhance admin cards with status banners and rejection notes; add admin_note support to the rejection flow and edge function.

## Files to Modify (5)

### 1. `src/components/SubmitRequestForm.tsx` — Full Rewrite
Multi-step flow inside the existing Dialog:

**Step 1 — Type Selection** (3 clickable cards):
- `add_child`: Baby icon, "إضافة مولود جديد"
- `add_spouse`: Heart icon, "إضافة زواج"
- `other`: MessageSquare icon, "ملاحظة أخرى"
- Selected card gets `border-primary bg-primary/5`

**Step 2 — Type-specific fields**:
- `add_child`: child name input (required), gender toggle (ذكر/أنثى), target member selector (label "أب المولود"), optional notes textarea
- `add_spouse`: spouse name input (required), target member selector (label "العضو المعني"), optional notes textarea
- `other`: target member selector, required textarea (label "تفاصيل الطلب")
- Target member: reuse existing search pattern, pre-filled if `targetMember` prop provided
- "رجوع" button to go back to step 1

**Step 3 — Confirmation screen** (replaces closing dialog):
- Checkmark icon + "تم إرسال طلبك بنجاح"
- Summary: type label, member name, brief details
- "سيتم مراجعة طلبك من قِبل الإدارة"
- "إغلاق" button

**On submit**: call `submitRequest()` with correct `type` (`add_child`/`add_spouse`/`other`) and structured `data` object. Also save to `localStorage('my_requests')` array for tracking.

State: `step` (1/2/3), `requestType`, `childName`, `childGender`, `spouseName`, `textContent`, `notes`, `selectedTarget`, `submitting`, `searchQuery`.

### 2. `src/pages/Profile.tsx` — Add "طلباتي" Section
Insert new section between the "Request Change Portal" (section 8) and "View in tree + Logout" (section 9):

- Read `JSON.parse(localStorage.getItem('my_requests') || '[]')`
- Show up to 10 most recent requests
- Each item: type icon + label, member name, summary text, relative Arabic time, status badge (pending=amber, approved=green, completed=gray)
- Empty state: "لا توجد طلبات مرسلة بعد"
- Import `relativeArabicTime` helper (extract to shared util or inline)

### 3. `src/components/admin/requests/RequestCard.tsx` — Status Banners + Notes
- For non-pending requests, add a colored banner at top of card:
  - `approved`: green strip with "✓ تم القبول"
  - `completed`: gray strip with "✓ تمت المعالجة"
- If `request.notes` exists and status !== 'pending', show "ملاحظة الإدارة: {notes}" below the body
- Keep existing layout otherwise unchanged

### 4. `src/components/admin/requests/RequestDetailSheet.tsx` — Rejection Notes
- Add `rejectionNote` state and `showRejectForm` state
- When admin clicks "رفض":
  - Show inline textarea "سبب الرفض (اختياري)" with confirm/cancel buttons
  - On confirm: call `family-api/resolve-request` with `decision: 'rejected'` and `adminNote: rejectionNote`
- Update the approve call to also pass `adminNote: ''` (no note on approve)

### 5. `supabase/functions/family-api/index.ts` — Save admin_note on resolve
In the `resolve-request` handler, update the final status update to also save the admin note:
```
await supabase.from("family_requests")
  .update({ 
    status: newStatus, 
    notes: adminNote || null 
  })
  .eq("id", requestId);
```
- Read `adminNote` from request body (already destructured alongside other fields)
- Change `decision === "approved" ? "approved" : "completed"` to handle `"rejected"` → `"completed"` mapping

## Technical Details
- `submitRequest` in `dataService.ts` already accepts any `type` string and `data` object — no change needed there
- `family_requests.data` is JSONB, so structured fields (child_name, child_gender, spouse_name, text_content) are already supported
- localStorage tracking is client-only; status stays "pending" until a future enhancement syncs with server
- No DB migration needed — `notes` column already exists on `family_requests`

