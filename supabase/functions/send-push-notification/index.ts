import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ApplicationServer } from "jsr:@negrel/webpush";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_ids, title, body, url } = await req.json();

    if (!user_ids?.length || !title) {
      return new Response(
        JSON.stringify({ error: "user_ids and title required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appServer = await ApplicationServer.new({
      contactInformation: "mailto:admin@khunaini.app",
      vapidKeys: {
        publicKey: Deno.env.get("VAPID_PUBLIC_KEY")!,
        privateKey: Deno.env.get("VAPID_PRIVATE_KEY")!,
      },
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, user_id")
      .in("user_id", user_ids);

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({ title, body: body || "", url: url || "/" });
    const expiredIds: string[] = [];
    let sent = 0;

    for (const sub of subs) {
      try {
        const subscriber = appServer.subscribe({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        });
        await subscriber.pushTextMessage(payload, {});
        sent++;
      } catch (err: any) {
        const msg = err?.message || "";
        const status = err?.statusCode || err?.status;
        if (status === 410 || status === 404 || msg.includes("410") || msg.includes("Gone")) {
          expiredIds.push(sub.id);
        } else {
          console.error(`[Push] Failed for ${sub.endpoint}:`, msg);
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", expiredIds);
      console.log(`Cleaned ${expiredIds.length} expired subscriptions`);
    }

    return new Response(
      JSON.stringify({ sent, expired: expiredIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-push-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
