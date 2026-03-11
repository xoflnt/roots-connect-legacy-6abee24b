import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WASAGE_API_KEY = Deno.env.get("WASAGE_API_KEY");
    if (!WASAGE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "WASAGE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop(); // "send" or "verify"
    const body = await req.json();

    let wasageUrl: string;
    let wasageBody: Record<string, unknown>;

    if (path === "send") {
      wasageUrl = "https://api.wasage.com/v1/otp/send";
      wasageBody = { phone: body.phone, template_id: body.template_id || undefined };
    } else if (path === "verify") {
      wasageUrl = "https://api.wasage.com/v1/otp/verify";
      wasageBody = { phone: body.phone, code: body.code };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint. Use /send or /verify" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(wasageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WASAGE_API_KEY}`,
      },
      body: JSON.stringify(wasageBody),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
