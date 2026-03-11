/**
 * SMS/WhatsApp OTP service via wasage.com Edge Function.
 * Falls back to mock if edge function is unavailable.
 */

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const EDGE_URL = PROJECT_ID
  ? `https://${PROJECT_ID}.supabase.co/functions/v1/wasage-otp`
  : null;

const MOCK_DELAY_MS = 2000;
const VALID_TEST_CODE = "1234";

/** Send OTP via edge function or mock */
export async function sendOTP(phone: string): Promise<boolean> {
  if (EDGE_URL) {
    try {
      const res = await fetch(`${EDGE_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) return true;
      console.warn("[wasageSms] Edge function error:", data);
      // Fall through to mock
    } catch (err) {
      console.warn("[wasageSms] Edge function unavailable, using mock:", err);
    }
  }

  // Mock fallback
  console.log(`[wasageSms] Sending OTP to ${phone} (mock)`);
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return true;
}

/** Verify OTP via edge function or mock (code "1234" in mock) */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  if (EDGE_URL) {
    try {
      const res = await fetch(`${EDGE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (res.ok) return data.success !== false;
      console.warn("[wasageSms] Edge function verify error:", data);
    } catch (err) {
      console.warn("[wasageSms] Edge function unavailable, using mock:", err);
    }
  }

  // Mock fallback
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return code === VALID_TEST_CODE;
}
