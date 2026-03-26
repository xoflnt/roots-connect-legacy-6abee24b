

# Add Soft Dark Halo Text Shadow to Hero Text

## Changes — single file: `src/components/LandingPage.tsx`

The new unified text shadow for all hero text elements:
```
textShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.8)'
```

### Elements to update

| Location | Line(s) | Current textShadow |
|----------|---------|-------------------|
| h1 title "بوابة تراث الخنيني" | 233 | `0 2px 16px …, 0 1px 4px …` |
| Subtitle "فرع الزلفي" | 236 | same as title |
| User name in dashboard card | 261 | `0 2px 8px rgba(0,0,0,0.5)` |
| Stats labels (الأبناء etc.) | 289 | `0 1px 4px rgba(0,0,0,0.6)` |
| Stats numbers | 288 | none — add it |
| Action button labels (نسبي/قرابة/ملفي) | 312-316 | none — add it |
| Guest heading "اكتشف موقعك" | 332 | `0 2px 16px …, 0 1px 4px …` |
| Quick Actions labels | 449 | `0 1px 4px rgba(0,0,0,0.6)` |
| Bottom buttons (أرسل طلب / دليل) | 461, 469 | `0 1px 4px rgba(0,0,0,0.6)` |

All replaced with the same halo shadow. No other changes.

