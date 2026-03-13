

# PWA Setup Plan

## Goal
Add Progressive Web App (PWA) support so users can install the app on their phone home screen, work offline, and get a native app-like experience.

## Steps

### 1. Install vite-plugin-pwa dependency
Add `vite-plugin-pwa` to devDependencies for manifest generation and service worker.

### 2. Configure vite.config.ts
- Add `VitePWA` plugin with auto-generated manifest
- Configure workbox with `navigateFallbackDenylist: [/^\/~oauth/]` for auth flows
- Set app name: "شجرة عائلة الخنيني"
- Icons: 192x192, 512x512 PNGs (generated from favicon.ico)

### 3. Update index.html with mobile meta tags
Add:
- `apple-mobile-web-app-capable` 
- `apple-mobile-web-app-status-bar-style`
- `apple-mobile-web-app-title`
- `theme-color` meta tag
- `manifest` link tag

### 4. Generate PWA icons
Create icon files in public/pwa/:
- `icon-192x192.png`
- `icon-512x512.png` 
- `apple-touch-icon.png`

### 5. Manifest details
- short_name: "الخنيني"
- name: "شجرة عائلة الخنيني - فرع الزلفي"
- description: "بوابة تراث الخنيني — فرع الزلفي"
- background_color: "#F6F4F0"
- theme_color: "#123026"
- start_url: "/"
- display: "standalone"

## Files to Modify
| File | Change |
|------|--------|
| `package.json` | Add vite-plugin-pwa |
| `vite.config.ts` | Add PWA plugin configuration |
| `index.html` | Add mobile/PWA meta tags |
| `public/pwa/` | Generate icon files |

