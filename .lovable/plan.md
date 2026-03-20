

# Add Mother Selection for add_child Requests

## Problem
When submitting an "add child" request, users cannot specify the mother even when the selected father has known spouses.

## Changes — Single file: `src/components/SubmitRequestForm.tsx`

### 1. Add state
```ts
const [selectedMother, setSelectedMother] = useState("");
```
Reset it in `resetForm()`.

### 2. Compute spouses list from selectedTarget
```ts
const fatherSpouses = useMemo(() => {
  if (requestType !== "add_child" || !selectedTarget?.spouses) return [];
  return selectedTarget.spouses.split(/[،,]/).map(s => s.trim()).filter(Boolean);
}, [requestType, selectedTarget]);
```

### 3. Render mother selection (after `renderTargetSelector("أب المولود")`, before notes)
Only shown when `fatherSpouses.length > 0`:
- Label: "اختر أم المولود:"
- Radio-style buttons: one per spouse + "غير معروفة"
- Selected: `border-primary bg-primary/5`, Unselected: `border-border bg-card`
- Min height 48px, full width, text-right

### 4. Include in request data
In `handleSubmit`, for `add_child`:
```ts
data.mother_name = selectedMother || "";
```

### 5. Include in localStorage summary
Add `motherName: selectedMother || "غير معروفة"` to the saved object.

### 6. Include in confirmation screen summary
Add a row showing the mother name when type is `add_child`.

