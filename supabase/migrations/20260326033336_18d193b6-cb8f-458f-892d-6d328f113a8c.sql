DROP POLICY IF EXISTS "anon_insert_push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "anon_upsert_push_subscriptions" ON public.push_subscriptions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);