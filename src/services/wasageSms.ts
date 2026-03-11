/**
 * Mock SMS OTP service — simulates wasage.com API.
 *
 * Production integration:
 * ─────────────────────────
 * Base URL: https://api.wasage.com/v1
 * Endpoints:
 *   POST /otp/send   — body: { phone, template_id }
 *   POST /otp/verify  — body: { phone, code }
 * Headers:
 *   Authorization: Bearer <WASAGE_API_KEY>
 *   Content-Type: application/json
 *
 * Store WASAGE_API_KEY as a server-side secret (Supabase Edge Function secret
 * or env var). Never expose it in client-side code.
 */

const MOCK_DELAY_MS = 2000;
const VALID_TEST_CODE = "1234";

/** Simulate sending an OTP to `phone`. Always resolves `true`. */
export async function sendOTP(phone: string): Promise<boolean> {
  console.log(`[wasageSms] Sending OTP to ${phone} (mock)`);
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return true;
}

/** Simulate verifying an OTP. Only code "1234" is accepted. */
export async function verifyOTP(_phone: string, code: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return code === VALID_TEST_CODE;
}
