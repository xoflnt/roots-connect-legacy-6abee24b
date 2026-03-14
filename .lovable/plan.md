

# Add Quick Actions Grid to LandingPage.tsx

## Change Summary
Add a 3×2 grid of quick action cards after Section 2A (dashboard) for logged-in users and after Section 2B (guest CTA) for guests. Show for ALL users.

## Implementation

### File: `src/components/LandingPage.tsx`

**New Imports (add to existing imports):**
- `BookMarked` from lucide-react (already has Map, ScrollText, Scale, BookOpen, Send)

**New Section (insert after Section 2A ends at line 263, and after Section 2B ends at line 326):**

Create a reusable Quick Actions Grid component rendered in both positions:

```tsx
{/* Quick Actions Grid */}
<section className="py-3 px-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
  <div className="max-w-lg mx-auto grid grid-cols-3 gap-2.5">
    {[
      { label: "الشجرة", icon: Map, color: "text-primary", onClick: onBrowseTree },
      { label: "النسب", icon: ScrollText, color: "text-accent", onClick: () => currentUser ? navigate(`/person/${currentUser.memberId}`) : onBrowseTree() },
      { label: "القرابة", icon: Scale, color: "text-primary", onClick: onBrowseTree },
      { label: "الوثائق", icon: BookOpen, color: "text-amber-600", onClick: () => navigate("/documents") },
      { label: "الدليل", icon: BookMarked, color: "text-muted-foreground", onClick: () => navigate("/guide") },
      { label: "طلب تعديل", icon: Send, color: "text-accent", onClick: () => setRequestOpen(true) },
    ].map((action) => (
      <button
        key={action.label}
        onClick={action.onClick}
        className="flex flex-col items-center gap-1.5 rounded-xl border bg-card/60 p-3 min-h-[72px] text-center hover:bg-card hover:shadow-sm transition-all"
      >
        <action.icon className={`h-5 w-5 ${action.color}`} />
        <span className="text-xs font-medium text-foreground">{action.label}</span>
      </button>
    ))}
  </div>
</section>
```

**Placement:**
1. After line 263 (end of Section 2A dashboard) — for logged-in users
2. After line 326 (end of Section 2B guest CTA) — for guests

## Changes Made
- Added `BookMarked` import
- Created Quick Actions Grid with 6 action cards
- Inserted grid after personal dashboard (logged-in)
- Inserted grid after guest CTA (guests)
- Grid is shown to ALL users regardless of login state

