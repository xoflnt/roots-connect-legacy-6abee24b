

# Add Sync Button to Admin Panel

## What
Add a temporary "مزامنة البيانات" button to Admin.tsx that calls the `seed-family-data` edge function with all members from `getAllMembers()`.

## Changes — Single file: `src/pages/Admin.tsx`

### 1. Add import
- Add `supabase` import from `@/integrations/supabase/client`
- Add `Database` icon from lucide-react

### 2. Add state variables in `AdminContent`
```typescript
const [syncing, setSyncing] = useState(false);
const [syncResult, setSyncResult] = useState('');
```

### 3. Add handler
```typescript
const handleSync = async () => {
  setSyncing(true);
  setSyncResult('');
  try {
    const members = getAllMembers();
    const { data, error } = await supabase.functions.invoke('seed-family-data', {
      body: { members }
    });
    if (error) throw error;
    setSyncResult(`تمت المزامنة: ${data?.inserted ?? members.length} فرد`);
  } catch (err: any) {
    setSyncResult('فشلت المزامنة: ' + (err.message || 'خطأ غير معروف'));
  } finally {
    setSyncing(false);
  }
};
```

### 4. Add button UI
Place a prominent blue sync button at the top of the admin content, between the header and stats section:
- Blue background (`bg-blue-600 hover:bg-blue-700 text-white`)
- Shows spinner + "جاري المزامنة..." while running
- Shows result message (success/error) below after completion

