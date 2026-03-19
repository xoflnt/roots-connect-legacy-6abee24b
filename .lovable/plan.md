

# Fix Countdown Button in ArchiveDeleteDialog

## Problem
The countdown logic uses `setInterval` which can cause race conditions and the button states aren't clearly separated into three phases.

## Changes — Single file: `src/components/admin/members/ArchiveDeleteDialog.tsx`

### State
Replace `isDeleting` with `readyToDelete`:
```ts
const [countdown, setCountdown] = useState(5);
const [counting, setCounting] = useState(false);
const [readyToDelete, setReadyToDelete] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

### Countdown effect
Replace `setInterval` with `setTimeout` that re-fires via dependency on `countdown`:
```ts
useEffect(() => {
  if (!counting) return;
  if (countdown <= 0) {
    setReadyToDelete(true);
    setCounting(false);
    return;
  }
  const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
  return () => clearTimeout(timer);
}, [counting, countdown]);
```

### Reset effect
Add `readyToDelete` to reset:
```ts
if (!isOpen) {
  setCountdown(5);
  setCounting(false);
  setReadyToDelete(false);
  setIsDeleting(false);
}
```

### Button rendering (3 states instead of current ternary chain)
Replace the `!counting ? ... : countdown > 0 ? ... : ...` block with:

1. **Not started** (`!counting && !readyToDelete`): outline variant, text "ابدأ الحذف", onClick starts countdown
2. **Counting** (`counting`): disabled, gray/muted background, text "حذف نهائي ({toArabicNum(countdown)})"
3. **Ready** (`readyToDelete`): filled destructive, text "تأكيد الحذف النهائي" / "جاري الحذف...", onClick executes delete

