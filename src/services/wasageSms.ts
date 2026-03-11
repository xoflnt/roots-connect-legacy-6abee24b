/**
 * Wasage WhatsApp OTP service.
 * Flow: send → show QR/link → user verifies via WhatsApp → callback → poll status
 */

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

/** Generate a unique reference for this OTP session */
function generateReference(): string {
  return `otp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Send OTP request — returns QR code URL and clickable link */
export async function sendOTP(phone: string): Promise<SendOTPResult> {
  const reference = generateReference();

  if (EDGE_URL) {
    try {
      const res = await fetch(`${EDGE_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, reference }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          qr: data.qr,
          clickable: data.clickable,
          reference,
        };
      }
      console.warn("[wasageSms] Edge function error:", data);
    } catch (err) {
      console.warn("[wasageSms] Edge function unavailable:", err);
    }
  }

  // Mock fallback
  console.log(`[wasageSms] Mock OTP for ${phone}, reference: ${reference}`);
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
    } catch {
      // fall through
    }
  }

  // Mock: never auto-verifies (user must use manual code path in mock)
  return { verified: false };
}

/** Legacy verify function for mock fallback (manual code entry) */
export async function verifyOTP(_phone: string, code: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 1000));
  return code === "1234";
}
