

# Fix AddMemberSheet: Lineage Preview & Mother Selection

## Changes to `src/components/admin/members/AddMemberSheet.tsx`

### FIX 1: Lineage Preview
**Lines 220-228** — `lineagePreview` memo currently appends grandfather, causing duplication since `selectedFather.name` already contains full lineage (e.g., "علي بن محمد").

Fix: Remove grandfather resolution. Just show `"{name} بن {selectedFather.name}"`.

Also remove the now-unused `grandfather` memo (lines 102-105).

### FIX 2: Mother Selection
**Lines 419-431** — Replace the read-only spouses badges with interactive radio-style selection buttons.

- Add state: `const [selectedMother, setSelectedMother] = useState("")`
- Reset `selectedMother` to `""` whenever `selectedFather` changes (add to the father selection handlers at lines 359, 287)
- Add to `resetForm()` (line 206)
- Replace the spouses display section with:
  - Label: "اختر أم الطفل:"
  - One button per spouse + "غير معروفة" option
  - Selected: `bg-primary/10 border-primary text-primary`, Unselected: `bg-card border-border`
  - Each button: `min-h-12 w-full rounded-xl text-right px-4`
- In `handleConfirm` (line 162), before building the member object, prepend mother info to notes:
  ```
  if (selectedMother && selectedMother !== 'غير معروفة') {
    const prefix = gender === 'M' ? `والدته: ${selectedMother}` : `والدتها: ${selectedMother}`;
    finalNotes = notes.trim() ? `${prefix}\n${notes.trim()}` : prefix;
  }
  ```
  Use `finalNotes` for `member.notes` instead of `notes.trim()`.

