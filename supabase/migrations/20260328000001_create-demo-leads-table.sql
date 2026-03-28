-- Demo leads: captures contact info from demo page visitors
CREATE TABLE IF NOT EXISTS public.demo_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_members TEXT,
  subdomain TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead (public insert)
CREATE POLICY "allow_insert_demo_leads" ON public.demo_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only service_role can read (for super admin)
CREATE POLICY "block_select_demo_leads" ON public.demo_leads
  FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY "block_update_demo_leads" ON public.demo_leads
  FOR UPDATE TO anon, authenticated USING (false);

CREATE POLICY "block_delete_demo_leads" ON public.demo_leads
  FOR DELETE TO anon, authenticated USING (false);
