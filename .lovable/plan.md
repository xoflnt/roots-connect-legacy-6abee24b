

# Remove PWAInstallBanner, Add Install Section to LandingPage

## Changes

### 1. Delete `src/components/PWAInstallBanner.tsx`

### 2. Edit `src/App.tsx`
- Remove import of `PWAInstallBanner` (line 10)
- Remove `<PWAInstallBanner />` render (line 54)

### 3. Edit `src/components/LandingPage.tsx`
- Add imports: `Tabs, TabsList, TabsTrigger, TabsContent` from shadcn, `Share` from lucide-react
- Update the hero install pill (lines 138-146): only show on Android (hide when `pwa.isIOS`)
- Add a new install section after the Guest CTA / Admin banner area (before the Three Pillars section, around line 273), containing:
  - Wrapped in standalone check — entire section hidden when `display-mode: standalone`
  - Card matching existing style: `rounded-2xl border bg-card/80 backdrop-blur-sm p-5`
  - Header pill badge: Smartphone icon + "حمّل التطبيق"
  - Title: "أضفه لشاشتك الرئيسية"
  - Subtitle: "تجربة أسرع وأجمل بدون شريط المتصفح"
  - Tabs (auto-selected by device): "أندرويد 🤖" | "آيفون 🍎"
  - **Android tab**: Install button when `canInstall`, success message when installed, or fallback instructions
  - **iOS tab**: 4 step cards with numbered circles + instructions + Safari warning note

