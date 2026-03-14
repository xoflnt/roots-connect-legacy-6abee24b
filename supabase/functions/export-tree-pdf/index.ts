import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function validateAdminToken(
  token: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<boolean> {
  const { data } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", token)
    .single();

  if (!data || new Date(data.expires_at) < new Date()) return false;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();

    // ── Validate admin token ──
    const adminToken = req.headers.get("x-admin-token");
    if (!adminToken || !(await validateAdminToken(adminToken, supabase))) {
      return json({ error: "Unauthorized" }, 401);
    }

    // ── Parse request body ──
    const { mode, branchId, branchLabel, appUrl } = await req.json();

    const BROWSERLESS_KEY = Deno.env.get("BROWSERLESS_API_KEY");
    if (!BROWSERLESS_KEY) {
      return json({ error: "Browserless API key not configured" }, 500);
    }

    const targetUrl = appUrl || "https://roots-connect-legacy.lovable.app";

    // ── Build the Puppeteer function code ──
    const branchFilterCode = mode === "branch" && branchId ? `
          // Step 5: Apply branch filter
          await page.evaluate((label) => {
            const filterBtn = document.querySelector('[aria-label="تصفية"]');
            if (filterBtn) {
              filterBtn.click();
              setTimeout(() => {
                const branchOption = Array.from(document.querySelectorAll('button'))
                  .find(b => b.textContent?.includes(label));
                if (branchOption) branchOption.click();
              }, 500);
            }
          }, '${(branchLabel || "").replace(/'/g, "\\'")}');
          await new Promise(r => setTimeout(r, 3000));
    ` : "";

    const functionCode = `
      module.exports = async ({ page }) => {
        try {
          // Set viewport
          await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 2 });

          // Step 1: Navigate to app
          console.log('[export] Navigating to:', '${targetUrl}');
          await page.goto('${targetUrl}', { waitUntil: 'networkidle2', timeout: 45000 });

          // Step 2: Set admin session in sessionStorage
          await page.evaluate(() => {
            sessionStorage.setItem('khunaini-admin-token', '${adminToken}');
            sessionStorage.setItem('khunaini-admin-expiry',
              new Date(Date.now() + 3600000).toISOString());
          });

          // Step 3: Reload so React picks up the admin session
          console.log('[export] Reloading with admin session...');
          await page.reload({ waitUntil: 'networkidle2', timeout: 45000 });

          // Step 4: Wait for React Flow to initialize
          console.log('[export] Waiting for .react-flow__viewport...');
          await page.waitForSelector('.react-flow__viewport', { timeout: 60000 });
          console.log('[export] React Flow found!');
          await new Promise(r => setTimeout(r, 5000));

          // Expand all nodes
          await page.evaluate(() => {
            return new Promise((resolve) => {
              const expandBtn = document.querySelector('[aria-label="توسيع الشجرة"]');
              if (expandBtn) {
                expandBtn.click();
                setTimeout(() => {
                  const allBtns = Array.from(document.querySelectorAll('button'));
                  const expandAll = allBtns.find(b => b.textContent?.includes('توسيع الكل'));
                  if (expandAll) {
                    expandAll.click();
                    setTimeout(() => {
                      const confirm = allBtns.find(
                        b => b.textContent?.includes('موافق') ||
                             b.textContent?.includes('نعم') ||
                             b.textContent?.includes('متابعة')
                      );
                      if (confirm) confirm.click();
                      resolve();
                    }, 500);
                  } else { resolve(); }
                }, 800);
              } else { resolve(); }
            });
          });

          // Wait for all nodes to render
          await new Promise(r => setTimeout(r, 12000));

          // Fit view
          await page.evaluate(() => {
            const fitBtn = document.querySelector('[title="ملائمة العرض"]');
            if (fitBtn) fitBtn.click();
          });
          await new Promise(r => setTimeout(r, 3000));

          ${branchFilterCode}

          // Take screenshot
          console.log('[export] Taking screenshot...');
          const screenshot = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width: 3840, height: 2160 }
          });

          return {
            data: screenshot.toString('base64'),
            type: 'image/png'
          };
        } catch (err) {
          console.error('[export] Error in browser:', err.message);
          throw err;
        }
      };
    `;

    // ── Call Browserless.io v2 /function endpoint ──
    console.log('[export-tree-pdf] Calling Browserless /chromium/function...');
    const browserlessResponse = await fetch(
      `https://chrome.browserless.io/chromium/function?token=${BROWSERLESS_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: functionCode }),
      }
    );

    console.log('[export-tree-pdf] Response status:', browserlessResponse.status);

    if (!browserlessResponse.ok) {
      const err = await browserlessResponse.text();
      console.error("[export-tree-pdf] Browserless error:", err);
      throw new Error(`Browserless error: ${err}`);
    }

    const result = await browserlessResponse.json();
    console.log('[export-tree-pdf] Got result, data length:', result?.data?.length || 0);

    return json({
      success: true,
      screenshot: result.data,
      mimeType: "image/png",
    });
  } catch (error) {
    console.error("[export-tree-pdf] Error:", error);
    return json({ error: error.message || "Export failed" }, 500);
  }
});
