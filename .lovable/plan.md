

# Marketing Assets for شجرة عائلة الخنيني

## Overview
Create 4 marketing assets — all in Arabic using the platform's YearOfHandicrafts font and heritage color palette (Deep Palm Green #1B5438, Gold #D4A82B, Warm Sand #F6F3EE).

## Design Philosophy: "Heritage Cartography"

A visual language rooted in the quiet authority of genealogical documentation — where lineage is mapped with the reverence of ancient cartographers charting sacred land. Deep forest greens anchor compositions like the trunk of an ancestral tree, while gold accents trace connections like gilded ink on aged parchment. Every element placed with meticulous care, as if by a master calligrapher spending countless hours on a single page.

## Assets to Create

### 1. Product Screenshot
- Take a browser screenshot of the live app
- Frame it in a macOS-style window with the product-shot generator
- Use a custom gradient matching the heritage palette (deep green to warm sand)
- Output: `/mnt/documents/product-shot.png`

### 2. Social Media / OG Image (1200x630)
- Canvas-generated PNG with the heritage palette
- App logo/icon centered, family name "الخنيني" in display font
- Tagline: "بوابة تراث الخنيني — فرع الزلفي"
- Geometric pattern motif (dots/lines evoking tree branches)
- Output: `/mnt/documents/og-image.png`

### 3. Promotional Video (15-20 seconds)
- Remotion-based motion graphics
- Scene flow: Logo reveal → Feature highlights (tree, search, kinship) → CTA
- All text in Arabic with YearOfHandicrafts via @remotion/fonts
- Heritage color palette throughout
- Output: `/mnt/documents/promo-video.mp4`

### 4. PDF One-Pager
- Single A4 page, RTL layout
- Sections: Hero header, 3-4 feature highlights with icons, statistics, QR code to app URL
- reportlab with the custom OTF font registered
- Output: `/mnt/documents/one-pager.pdf`

## Execution Order
1. Screenshot the app → product shot
2. Generate OG image via Python canvas
3. Generate PDF one-pager
4. Build and render Remotion video

## Technical Details
- Font: `/home/user/project/public/fonts/TheYearofHandicrafts-*.otf`
- Colors: Primary #1B5438, Gold #D4A82B, Background #F6F3EE, Fore