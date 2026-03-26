CREATE POLICY "anon_insert_push_subscriptions"
  ON public.push_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);