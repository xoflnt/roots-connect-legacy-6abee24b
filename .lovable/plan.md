

# Redesign LineageShareCard + Native Sharing

## Files to Modify

### 1. `src/components/LineageShareCard.tsx` — Complete Rewrite

Replace entire file with new heritage-themed design:

- **Colors**: Warm cream background (`#F7F3EE` → `#EDE5D8` gradient) matching KinshipShareCard palette — no more dark green
- **Gender fix**: Use `"ابن"` / `"بنت"` based on `chain[i].gender`
- **Branch integration**: Import `getBranch`, show branch pill with correct color in header
- **Layout** (1080×1350):
  - Top gold gradient line (4px)
  - Subtle single-border frame (20px inset, gold 40%)
  - Header: "بوابة تراث الخنيني" + "فرع الزلفي" + branch pill
  - Gold separator
  - Main content: First name large (44px bold, dark green), vertical dashed center line connecting all ancestors, each ancestor with small gold dot + "ابن/بنت" connector text + name (30px, fading opacity), ending with "◆ الخنيني ◆" in gold (48px)
  - Footer: generation count, branding, bottom gold line
  - No URL, no QR, no corner ornaments
- **Export**: `generateLineageImage` returns `Blob` (same API)

### 2. `src/components/LineageView.tsx` — Native Sharing

- Import `useIsMobile` from `@/hooks/use-mobile`
- Replace `handleDownloadCard` (lines 75-83): Generate blob, try `navigator.share` with file on mobile, fall back to download link on desktop
- Update button label (line 135): Show "شارك النسب" on mobile, "تحميل البطاقة" on desktop
- Change icon from `Download` to conditional `Share2`/`Download`

