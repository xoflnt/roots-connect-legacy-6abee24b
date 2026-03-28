import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") || "a@nasaby.app";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
      },
    });
  }

  try {
    const { family_name, contact_name, phone, estimated_members, subdomain } = await req.json();

    const whatsappLink = `https://wa.me/966${(phone || "").replace(/^0/, "")}`;

    const html = `
      <div dir="rtl" style="font-family: sans-serif; padding: 20px;">
        <h2>🌳 طلب ديمو جديد</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">اسم العائلة</td><td style="padding: 8px; border: 1px solid #ddd;">${family_name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">اسم الشخص</td><td style="padding: 8px; border: 1px solid #ddd;">${contact_name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">رقم الجوال</td><td style="padding: 8px; border: 1px solid #ddd;" dir="ltr">${phone}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">العدد التقريبي</td><td style="padding: 8px; border: 1px solid #ddd;">${estimated_members || "غير محدد"}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">السب دومين</td><td style="padding: 8px; border: 1px solid #ddd;" dir="ltr">${subdomain}.nasaby.app</td></tr>
        </table>
        <p style="margin-top: 16px;">
          <a href="${whatsappLink}" style="background: #25d366; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">تواصل عبر واتساب</a>
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "نسبي <noreply@nasaby.app>",
        to: [NOTIFY_EMAIL],
        subject: `🌳 طلب ديمو جديد — عائلة ${family_name}`,
        html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
