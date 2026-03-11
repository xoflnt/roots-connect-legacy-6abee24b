import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop(); // "send", "callback", or "status"

    // ─── SEND OTP ───
    if (path === "send" && req.method === "POST") {
      const WASAGE_USERNAME = Deno.env.get("WASAGE_USERNAME");
      const WASAGE_PASSWORD = Deno.env.get("WASAGE_PASSWORD");
      if (!WASAGE_USERNAME || !WASAGE_PASSWORD) {
        return new Response(
          JSON.stringify({ error: "Wasage credentials not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const { phone, reference, message } = body;

      if (!phone || !reference) {
        return new Response(
          JSON.stringify({ error: "phone and reference are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const otpMessage = message || `مرحباً بك في بوابة آل الخنيني، رمز التحقق الخاص بك هو`;

      // Call wasage API
      const wasageUrl = `https://wasage.com/api/otp/?Username=${encodeURIComponent(WASAGE_USERNAME)}&Password=${encodeURIComponent(WASAGE_PASSWORD)}&Reference=${encodeURIComponent(reference)}&Message=${encodeURIComponent(otpMessage)}`;

      const response = await fetch(wasageUrl, { method: "GET" });
      const data = await response.json();

      if (data.Code === "5500") {
        // Success - store in DB
        const supabase = getSupabaseAdmin();
        await supabase.from("otp_verifications").upsert({
          reference,
          phone,
          otp_code: data.OTP,
          qr_url: data.QR,
          clickable_url: data.Clickable,
          status: "pending",
        }, { onConflict: "reference" });

        return new Response(
          JSON.stringify({
            success: true,
            qr: data.QR,
            clickable: data.Clickable,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, error: "Wasage API error", code: data.Code }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ─── CALLBACK from Wasage ───
    if (path === "callback") {
      const cbUrl = new URL(req.url);
      const otp = cbUrl.searchParams.get("OTP");
      const mobile = cbUrl.searchParams.get("Mobile");
      const reference = cbUrl.searchParams.get("Reference");
      const secret = cbUrl.searchParams.get("Secret");
      const clientId = cbUrl.searchParams.get("ClientID");
      const clientName = cbUrl.searchParams.get("ClientName");

      // Verify secret
      const WASAGE_SECRET = Deno.env.get("WASAGE_SECRET");
      if (secret !== WASAGE_SECRET) {
        return new Response(
          JSON.stringify({ error: "Invalid secret" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!reference) {
        return new Response(
          JSON.stringify({ error: "Reference is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update verification status
      const supabase = getSupabaseAdmin();
      await supabase
        .from("otp_verifications")
        .update({
          status: "verified",
          mobile: mobile || null,
          client_id: clientId || null,
          client_name: clientName || null,
          verified_at: new Date().toISOString(),
        })
        .eq("reference", reference);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── STATUS (polling) ───
    if (path === "status" && req.method === "POST") {
      const body = await req.json();
      const { reference } = body;

      if (!reference) {
        return new Response(
          JSON.stringify({ error: "reference is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("otp_verifications")
        .select("status, client_name, mobile")
        .eq("reference", reference)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ status: "not_found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ status: data.status, clientName: data.client_name, mobile: data.mobile }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint. Use /send, /callback, or /status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
