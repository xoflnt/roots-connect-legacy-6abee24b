

# Fix: Browserless Tree Not Rendering

## Problem
The Browserless screenshot call succeeds syntactically (v2 API accepted), but the tree never renders because:
1. The app opens on the landing/default page — not the tree view
2. `sessionStorage` is set via `addScriptTag` AFTER page load — React doesn't re-render
3. `.react-flow__viewport` never appears → 30s timeout → 500 error

## Solution
Two changes to `supabase/functions/export-tree-pdf/index.ts`:

### Change 1: Use `/chromium/function` instead of `/chromium/screenshot`
The `/chromium/function` endpoint lets us run a full Puppeteer-style script with access to `page` object. This allows us to:
- Navigate to the page
- Set sessionStorage
- **Reload** the page so React picks up the admin session
- Wait for tree to render
- Take screenshot manually

### Change 2: Target the correct URL
Instead of just the app root, navigate to the specific tree route (e.g., `targetUrl + "/?view=map"` or whatever route shows the tree).

### Implementation

Replace the Browserless fetch call with a `/chromium/function` call:

```typescript
const browserlessResponse = await fetch(
  `https://chrome.browserless.io/chromium/function?token=${BROWSERLESS_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: `
        module.exports = async ({ page }) => {
          // Set viewport
          await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 2 });
          
          // Navigate to app
          await page.goto('${targetUrl}', { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Set admin session in sessionStorage
          await page.evaluate(() => {
            sessionStorage.setItem('khunaini-admin-token', '${adminToken}');
            sessionStorage.setItem('khunaini-admin-expiry', 
              new Date(Date.now() + 3600000).toISOString());
          });
          
          // Reload so React picks up the session
          await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
          
          // Wait for React Flow
          await page.waitForSelector('.react-flow__viewport', { timeout: 60000 });
          await new Promise(r => setTimeout(r, 5000));
          
          // Expand all, fit view via page.evaluate
          await page.evaluate(() => {
            // ... expand/fit logic
          });
          
          await new Promise(r => setTimeout(r, 15000));
          
          // Take screenshot
          const screenshot = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width: 3840, height: 2160 }
          });
          
          return { data: screenshot.toString('base64'), type: 'image/png' };
        };
      `,
    }),
  }
);
```

### Files Changed
- `supabase/functions/export-tree-pdf/index.ts` only

### Key Differences
- Uses `/chromium/function` which gives full Puppeteer `page` access
- Sets sessionStorage then **reloads** so React recognizes the admin session
- Uses `page.waitForSelector` (Puppeteer native) instead of the REST `waitForSelector`
- Uses `page.screenshot()` directly instead of the REST screenshot options
- Returns base64 from the function code itself

