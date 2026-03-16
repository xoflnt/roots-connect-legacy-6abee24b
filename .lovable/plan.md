

# Two UI Improvements

## Improvement 1: LineageView.tsx — Single Share Button with Options

**Current**: Two confusing share buttons with similar labels.
**New**: One "شارك النسب" button that opens a bottom sheet (mobile) or dropdown (desktop) with two options.

### Changes to `src/components/LineageView.tsx`:
- Add `showShareOptions` state
- Import `Link, Image` from lucide-react, `Sheet/SheetContent/SheetHeader/SheetTitle` from UI
- Replace lines 132-162 (both buttons) with a single `Share2` button that sets `showShareOptions(true)`
- Add a bottom `Sheet` (mobile) / dropdown `div` (desktop) with:
  - Title: "كيف تبي تشارك؟"
  - Option 1: Link icon + "شارك كرابط" + subtitle, calls `handleShare()` then closes
  - Option 2: Image icon + "شارك كصورة" + subtitle, calls `handleDownloadCard()` then closes, shows spinner while downloading
- Style: `p-4 rounded-xl bg-card hover:bg-muted transition-colors`, label bold, subtitle muted

## Improvement 2: LandingPage.tsx — Split Request Button

**Current**: Single dashed "أرسل طلب تحديث البيانات" button.
**New**: Two buttons side by side.

### Changes to `src/components/LandingPage.tsx` (lines 402-412):
- Replace single button with `flex gap-2` container holding:
  - Button 1: "أرسل طلب تعديل" — Send icon, accent dashed style, `onClick: setRequestOpen(true)`
  - Button 2: "دليل الاستخدام" — BookOpen icon, muted border dashed style, `onClick: navigate('/guide')`
- Both `flex-1 min-h-[48px] rounded-xl border-dashed`

### Files modified:
1. `src/components/LineageView.tsx`
2. `src/components/LandingPage.tsx`

