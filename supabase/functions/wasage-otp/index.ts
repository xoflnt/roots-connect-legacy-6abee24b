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

/** Normalize phone: strip leading 0, ensure 966 prefix, digits only */
function formatPhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  // Remove leading + if passed as part of digits (shouldn't happen after replace, but safe)
  if (digits.startsWith("00966")) {
    digits = digits.slice(2); // remove leading 00
  }
  if (digits.startsWith("966")) {
    // already correct
  } else if (digits.startsWith("05") || digits.startsWith("5")) {
    // Saudi mobile: 05xxxxxxxx or 5xxxxxxxx
    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    digits = "966" + digits;
  } else if (digits.startsWith("0")) {
    digits = "966" + digits.slice(1);
  } else {
    digits = "966" + digits;
  }
  return digits;
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
        console.error("[wasage-otp] MISSING CREDENTIALS: WASAGE_USERNAME or WASAGE_PASSWORD not set");
        return new Response(
          JSON.stringify({ error: "Wasage credentials not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const { phone: rawPhone, reference, message } = body;

      if (!rawPhone || !reference) {
        console.error("[wasage-otp] Missing phone or reference in request body:", body);
        return new Response(
          JSON.stringify({ error: "phone and reference are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const phone = formatPhone(rawPhone);
      console.log("[wasage-otp] Formatted phone:", rawPhone, "→", phone);

      const otpMessage = message || `مرحباً بك في بوابة الخنيني، رمز التحقق الخاص بك هو`;

      // Build Wasage API URL
      const wasageUrl = `https://wasage.com/api/otp/?Username=${encodeURIComponent(WASAGE_USERNAME)}&Password=${encodeURIComponent(WASAGE_PASSWORD)}&Reference=${encodeURIComponent(reference)}&Message=${encodeURIComponent(otpMessage)}`;

      console.log("[wasage-otp] PAYLOAD SENT:", {
        url: wasageUrl.replace(WASAGE_PASSWORD, "***"),
        phone,
        reference,
        message: otpMessage,
      });

      const response = await fetch(wasageUrl, { method: "GET" });
      const responseText = await response.text();
      console.log("[wasage-otp] API RAW RESPONSE:", response.status, responseText);

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("[wasage-otp] Failed to parse Wasage response as JSON:", responseText);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid response from Wasage API", raw: responseText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[wasage-otp] API PARSED RESPONSE:", JSON.stringify(data));

      if (data.Code === "5500") {
        // Success - store in DB
        const supabase = getSupabaseAdmin();
        const { error: dbError } = await supabase.from("otp_verifications").upsert({
          reference,
          phone,
          otp_code: data.OTP as string,
          qr_url: data.QR as string,
          clickable_url: data.Clickable as string,
          status: "pending",
        }, { onConflict: "reference" });

        if (dbError) {
          console.error("[wasage-otp] DB upsert error:", dbError);
        }

        console.log("[wasage-otp] OTP sent successfully. Reference:", reference);
        return new Response(
          JSON.stringify({
            success: true,
            qr: data.QR,
            clickable: data.Clickable,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error("[wasage-otp] Wasage API returned error code:", data.Code, "Full:", JSON.stringify(data));
        return new Response(
          JSON.stringify({ success: false, error: "Wasage API error", code: data.Code, details: data }),
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

      console.log("[wasage-otp] CALLBACK received:", { otp, mobile, reference, clientId, clientName });

      // Verify secret
      const WASAGE_SECRET = Deno.env.get("WASAGE_SECRET");
      if (secret !== WASAGE_SECRET) {
        console.error("[wasage-otp] CALLBACK invalid secret");
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
      const { error: dbError } = await supabase
        .from("otp_verifications")
        .update({
          status: "verified",
          mobile: mobile || null,
          client_id: clientId || null,
          client_name: clientName || null,
          verified_at: new Date().toISOString(),
        })
        .eq("reference", reference);

      if (dbError) {
        console.error("[wasage-otp] CALLBACK DB update error:", dbError);
      }

      console.log("[wasage-otp] CALLBACK verified for reference:", reference);
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
    console.error("[wasage-otp] UNHANDLED ERROR:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
