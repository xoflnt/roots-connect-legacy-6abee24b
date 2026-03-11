/**
 * Wasage WhatsApp OTP service.
 * Flow: send → show QR/link → user verifies via WhatsApp → callback → poll status
 */
import { toast } from "@/hooks/use-toast";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const EDGE_URL = PROJECT_ID
  ? `https://${PROJECT_ID}.supabase.co/functions/v1/wasage-otp`
  : null;

export interface SendOTPResult {
  success: boolean;
  qr?: string;
  clickable?: string;
  reference?: string;
  error?: string;
}

/** Normalize phone: strip leading 0, ensure 966 prefix, digits only */
function formatPhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("00966")) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("966")) {
    // already correct
  } else if (digits.startsWith("0")) {
    digits = "966" + digits.slice(1);
  } else {
    digits = "966" + digits;
  }
  return digits;
}

/** Generate a unique reference for this OTP session */
function generateReference(): string {
  return `otp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Send OTP request — returns QR code URL and clickable link */
export async function sendOTP(phone: string): Promise<SendOTPResult> {
  const reference = generateReference();
  const formattedPhone = formatPhone(phone);

  console.log("[wasageSms] sendOTP called. Raw:", phone, "Formatted:", formattedPhone, "Reference:", reference);

  if (EDGE_URL) {
    try {
      const payload = { phone: formattedPhone, reference };
      console.log("[wasageSms] PAYLOAD SENT:", payload, "URL:", `${EDGE_URL}/send`);

      const res = await fetch(`${EDGE_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log("[wasageSms] API RESPONSE status:", res.status, "body:", responseText);

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("[wasageSms] Failed to parse response:", responseText);
        throw new Error(`Invalid response from server: ${res.status}`);
      }

      if (res.ok && data.success) {
        console.log("[wasageSms] OTP sent successfully. QR:", data.qr ? "yes" : "no");
        return {
          success: true,
          qr: data.qr as string | undefined,
          clickable: data.clickable as string | undefined,
          reference,
        };
      }

      // API returned an error
      console.error("[wasageSms] Edge function error:", data);
      throw new Error(
        `Wasage error: ${data.error || "Unknown"} (code: ${data.code || res.status})`
      );
    } catch (err) {
      console.error("[wasageSms] sendOTP failed:", err);
      toast({
        title: "خطأ في إرسال رمز التحقق",
        description:
          "عذراً، تعذر إرسال رمز التحقق. يرجى التأكد من الرقم والمحاولة لاحقاً.",
        variant: "destructive",
      });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  // Mock fallback
  console.log(`[wasageSms] Mock OTP for ${formattedPhone}, reference: ${reference}`);
  await new Promise((r) => setTimeout(r, 1500));
  return {
    success: true,
    qr: undefined,
    clickable: undefined,
    reference,
  };
}

/** Poll verification status */
export async function checkOTPStatus(
  reference: string
): Promise<{ verified: boolean; clientName?: string }> {
  if (EDGE_URL) {
    try {
      const res = await fetch(`${EDGE_URL}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (data.status === "verified") {
        return { verified: true, clientName: data.clientName };
      }
      return { verified: false };
    } catch (err) {
      console.error("[wasageSms] checkOTPStatus error:", err);
    }
  }

  // Mock: never auto-verifies
  return { verified: false };
}

/** Legacy verify function for mock fallback (manual code entry) */
export async function verifyOTP(_phone: string, code: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 1000));
  return code === "1234";
}
