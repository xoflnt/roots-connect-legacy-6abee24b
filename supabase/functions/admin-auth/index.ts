import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, password, token } = await req.json();
    const supabase = getSupabaseAdmin();

    // ─── VALIDATE existing session ───
    if (action === "validate") {
      if (!token) return json({ valid: false });

      const { data } = await supabase
        .from("admin_sessions")
        .select("expires_at")
        .eq("token", token)
        .single();

      if (!data || new Date(data.expires_at) < new Date()) {
        return json({ valid: false });
      }
      return json({ valid: true });
    }

    // ─── LOGIN ───
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword || password !== adminPassword) {
      return json({ error: "Unauthorized" }, 401);
    }

    const sessionToken = crypto.randomUUID() + "-" + Date.now();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2h

    await supabase.from("admin_sessions").insert({
      token: sessionToken,
      expires_at: expiresAt,
    });

    return json({ token: sessionToken, expiresAt });
  } catch (error) {
    console.error("[admin-auth] Error:", error);
    return json({ error: error.message || "Internal server error" }, 500);
  }
});
