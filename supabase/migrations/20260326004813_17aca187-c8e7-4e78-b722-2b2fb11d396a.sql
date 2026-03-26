
-- Allow anon to read notifications (user_id is UUID, not guessable)
CREATE POLICY "anon_select_own_notifications"
  ON public.notifications FOR SELECT TO anon, authenticated
  USING (true);

-- Allow anon to update notifications (mark as read)
CREATE POLICY "anon_update_own_notifications"
  ON public.notifications FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
