/**
 * Wasage SMS Service (wasage.com)
 * 
 * Mock implementation for OTP verification.
 * 
 * Production TODO:
 * - Replace mock functions with real Wasage API calls
 * - API endpoint: https://api.wasage.com/v1/sms/send (example)
 * - Store API key in Supabase/Cloud secrets (never in code)
 * - Create an edge function to proxy OTP requests server-side
 * 
 * For testing: any OTP code "1234" is accepted as valid.
 */

const OTP_STORE = new Map<string, string>();

export async function sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // In production, call Wasage API here
  const code = "1234"; // Mock code
  OTP_STORE.set(phone, code);

  console.log(`[Mock SMS] OTP "${code}" sent to ${phone}`);
  return { success: true, message: "تم إرسال رمز التحقق بنجاح" };
}

export async function verifyOTP(
  phone: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Accept "1234" as the universal test code
  if (code === "1234") {
    OTP_STORE.delete(phone);
    return { success: true, message: "تم التحقق بنجاح" };
  }

  return { success: false, message: "رمز التحقق غير صحيح، حاول مرة أخرى" };
}
