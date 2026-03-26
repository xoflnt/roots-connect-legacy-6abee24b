CREATE VIEW public.verified_users_lookup AS
  SELECT id, phone FROM public.verified_users;

GRANT SELECT ON public.verified_users_lookup TO anon, authenticated;