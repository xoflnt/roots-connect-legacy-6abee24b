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

    // ── Build the automation script ──
    // This script runs inside headless Chrome after page load.
    // It sets the admin session, navigates to the tree, expands all nodes,
    // fits the view, and signals readiness for screenshot capture.
    const automationScript = `
      async function waitFor(ms) {
        return new Promise(r => setTimeout(r, ms));
      }

      async function waitForElement(selector, timeout = 30000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          const el = document.querySelector(selector);
          if (el) return el;
          await waitFor(200);
        }
        throw new Error('Element not found: ' + selector);
      }

      // Step 1: Set admin session in sessionStorage
      sessionStorage.setItem('khunaini-admin-token', '${adminToken}');
      sessionStorage.setItem('khunaini-admin-expiry',
        new Date(Date.now() + 3600000).toISOString());

      // Step 2: Wait for React Flow to initialize
      await waitForElement('.react-flow__viewport');
      await waitFor(3000);

      // Step 3: Expand all nodes
      const expandBtn = document.querySelector('[aria-label="توسيع الشجرة"]');
      if (expandBtn) {
        expandBtn.click();
        await waitFor(500);
        const expandAll = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.includes('توسيع الكل'));
        if (expandAll) {
          expandAll.click();
          await waitFor(500);
        }
      }

      // Wait for all nodes to render after expansion
      await waitFor(8000);

      // Step 4: Fit view
      const fitBtn = document.querySelector('[title="ملائمة العرض"]');
      if (fitBtn) {
        fitBtn.click();
        await waitFor(2000);
      }

      ${mode === "branch" && branchId ? `
      // Step 5: Apply branch filter
      const filterBtn = document.querySelector('[aria-label="تصفية"]');
      if (filterBtn) {
        filterBtn.click();
        await waitFor(500);
        const branchOption = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.includes('${branchLabel || ""}'));
        if (branchOption) {
          branchOption.click();
          await waitFor(2000);
        }
      }
      ` : ""}

      // Signal ready for screenshot
      document.title = 'READY_FOR_EXPORT';
      await waitFor(1000);
    `;

    // ── Call Browserless.io screenshot endpoint ──
    const screenshotResponse = await fetch(
      `https://chrome.browserless.io/screenshot?token=${BROWSERLESS_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          options: {
            type: "png",
            encoding: "binary",
            fullPage: false,
            clip: {
              x: 0,
              y: 0,
              width: 3840,
              height: 2160,
            },
          },
          viewport: {
            width: 3840,
            height: 2160,
            deviceScaleFactor: 2,
          },
          waitFor: 2000,
          evaluate: automationScript,
          waitForFunction: {
            fn: "() => document.title === 'READY_FOR_EXPORT'",
            timeout: 120000,
          },
          gotoOptions: {
            waitUntil: "networkidle2",
            timeout: 30000,
          },
        }),
      }
    );

    if (!screenshotResponse.ok) {
      const err = await screenshotResponse.text();
      console.error("[export-tree-pdf] Browserless error:", err);
      throw new Error(`Browserless error: ${err}`);
    }

    const screenshotBuffer = await screenshotResponse.arrayBuffer();
    const screenshotBase64 = btoa(
      String.fromCharCode(...new Uint8Array(screenshotBuffer))
    );

    return json({
      success: true,
      screenshot: screenshotBase64,
      mimeType: "image/png",
    });
  } catch (error) {
    console.error("[export-tree-pdf] Error:", error);
    return json({ error: error.message || "Export failed" }, 500);
  }
});
