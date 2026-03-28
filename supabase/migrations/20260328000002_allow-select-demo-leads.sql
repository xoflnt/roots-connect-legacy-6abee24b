-- Drop the blocking select policy and allow reads for demo_leads
DROP POLICY IF EXISTS "block_select_demo_leads" ON public.demo_leads;

CREATE POLICY "Allow select for demo leads"
  ON public.demo_leads FOR SELECT
  TO anon, authenticated
  USING (true);
