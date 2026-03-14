

# Fix Quick Actions Grid + Add Event Listeners

## Changes

### File 1: `src/components/LandingPage.tsx`

**1. Add imports:** `AlignJustify`, `ChevronLeft` from lucide-react; `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from ui/sheet

**2. Add state:** `const [showNasabSheet, setShowNasabSheet] = useState(false)` and `const [nasabQuery, setNasabQuery] = useState("")`

**3. Fix grid (lines 331-348):**
- Button 2 "النسب": change onClick to `() => setShowNasabSheet(true)`
- Button 3 "القرابة": change onClick to `() => { onBrowseTree(); window.dispatchEvent(new CustomEvent('switch-to-kinship')); }`
- Button 6: replace "طلب تعديل" / Send / text-accent with "القائمة" / AlignJustify / text-muted-foreground, onClick: `() => { onBrowseTree(); window.dispatchEvent(new CustomEvent('switch-to-list')); }`

**4. Add "طلب تعديل" button immediately after the grid section (after line 349):**
```tsx
<section className="px-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
  <div className="max-w-lg mx-auto">
    <button
      onClick={() => setRequestOpen(true)}
      className="w-full rounded-xl border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 min-h-[44px] flex items-center justify-center gap-2 text-sm text-accent font-medium transition-colors"
    >
      <Send className="h-4 w-4" />
      أرسل طلب تحديث البيانات
    </button>
  </div>
</section>
```

**5. Add Nasab Sheet before `</div>` closing (before SubmitRequestForm):**
A bottom Sheet identical to Index.tsx's lineage sheet — title "نسب من؟", logged-in user shortcut (if currentUser), search input, results list. On member select: `onSearchSelect(m.id)` then close sheet.

### File 2: `src/pages/Index.tsx`

**Add event listeners in a useEffect (after line 92):**
```tsx
useEffect(() => {
  const onKinship = () => { setActiveTab('kinship'); persistTab('kinship'); };
  const onList = () => { setActiveTab('list'); persistTab('list'); };
  window.addEventListener('switch-to-kinship', onKinship);
  window.addEventListener('switch-to-list', onList);
  return () => {
    window.removeEventListener('switch-to-kinship', onKinship);
    window.removeEventListener('switch-to-list', onList);
  };
}, [persistTab]);
```

## Summary of Changes
- **LandingPage.tsx**: Fixed النسب to open a nasab sheet, fixed القرابة to dispatch kinship event, replaced طلب تعديل grid button with القائمة (list), added full-width dashed "طلب تعديل" button below grid, added Nasab search sheet
- **Index.tsx**: Added event listeners for `switch-to-kinship` and `switch-to-list` custom events

