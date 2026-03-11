
DROP POLICY "Allow public insert" ON public.otp_verifications;
DROP POLICY "Allow public update" ON public.otp_verifications;

CREATE POLICY "Service role only insert" ON public.otp_verifications FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role only update" ON public.otp_verifications FOR UPDATE TO service_role USING (true) WITH CHECK (true);
