

# Phase 1A: Admin Panel Foundation — Modular Shell

## Summary
Replace the monolithic Admin.tsx with a navigable admin shell: sidebar on desktop, bottom bar on mobile, section-based routing. All existing functionality moves into the 'dashboard' section.

## Files to Create

### 1. `src/types/admin.ts`
Type definitions: `AdminSection` union, `AdminRequest`, `VerifiedUser`, `DashboardStats` — exactly as specified.

### 2. `src/utils/normalizeArabic.ts`
Two functions: `normalizeArabic()` (strip diacritics, normalize hamza/ta-marbuta/alef-maqsura/tatweel) and `arabicMatch()` (substring check using normalized forms).

### 3. `src/components/admin/AdminSidebar.tsx`
- RTL sidebar, 240px wide, border-left (RTL context)
- 8 nav items with lucide icons, Arabic labels, min-h-12 tap targets
- Header: "لوحة الإدارة" + "بوابة تراث الخنيني"
- Footer: admin name + logout button
- Active state: `bg-primary text-primary-foreground rounded-lg`

### 4. `src/components/admin/AdminBottomBar.tsx`
- Fixed bottom, `md:hidden`, safe-area padding
- 4 tabs: الرئيسية, الأعضاء, الطلبات, المزيد
- "المزيد" opens a Sheet listing remaining 5 sections
- Min-h-14 per tab, min-h-12 per sheet item

### 5. `src/components/admin/AdminLayout.tsx`
- Props: `currentSection`, `onNavigate`, `adminName`, `onLogout`, `children`
- Desktop: flex row — sidebar (right in RTL) + scrollable content
- Mobile: full-width content + bottom bar
- Uses `useIsMobile()` hook

## Files to Modify

### 6. `src/pages/Admin.tsx`
- Keep `AdminProtect` wrapper, `getAdminToken`, all helper functions (`StatCard`, `RequestCard`, CSV helpers) untouched
- Add `section` state of type `AdminSection`
- Wrap existing content in `<AdminLayout>` 
- When `section === 'dashboard'`: render ALL existing content (sync, stats, tabs)
- Other sections: placeholder "قيد التطوير"
- Logout clears sessionStorage keys + reloads

## Technical Details

- All containers use `dir="rtl"`, margin/padding use `ms-`/`me-` not `ml-`/`mr-`
- Font sizes ≥ 16px, tap targets ≥ 48px
- Desktop breakpoint: `md:` (768px) via Tailwind + `useIsMobile()` hook
- Sheet component from `@/components/ui/sheet` for mobile "more" menu
- Full-height layout: `h-[100dvh]` with `env(safe-area-inset-*)` padding

