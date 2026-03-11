
CREATE TABLE public.otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  phone text NOT NULL,
  otp_code text,
  qr_url text,
  clickable_url text,
  status text NOT NULL DEFAULT 'pending',
  client_id text,
  client_name text,
  mobile text,
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.otp_verifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select own" ON public.otp_verifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public update" ON public.otp_verifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
