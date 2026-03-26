

# Fix Branch Badge in LineageView.tsx

## Single change — Line 341

Replace:
```tsx
<span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: bs.bg, color: bs.text, opacity: 0.7 }}>
```

With:
```tsx
<span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: bs.bg, color: bs.text, borderColor: bs.stroke + '40' }}>
```

Changes:
- Remove `opacity: 0.7` (text was nearly invisible)
- Upgrade from `text-[9px] font-bold` to `text-xs font-medium` for readability
- Add `whitespace-nowrap` to prevent wrapping that makes it look like a bar
- Add `px-2` for better padding
- Add `borderColor` from branch style for subtle definition

Single file: `src/components/LineageView.tsx`

