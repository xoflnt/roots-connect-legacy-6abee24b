-- ═══════════════════════════════════════════════════════════
-- Enforce NOT NULL on family_id across all tenant-scoped tables
-- All rows are already backfilled — zero NULLs confirmed
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.family_members
  ALTER COLUMN family_id SET NOT NULL;

ALTER TABLE public.verified_users
  ALTER COLUMN family_id SET NOT NULL;

ALTER TABLE public.family_requests
  ALTER COLUMN family_id SET NOT NULL;

ALTER TABLE public.document_likes
  ALTER COLUMN family_id SET NOT NULL;

ALTER TABLE public.document_comments
  ALTER COLUMN family_id SET NOT NULL;

ALTER TABLE public.push_subscriptions
  ALTER COLUMN family_id SET NOT NULL;

ALTER TABLE public.notifications
  ALTER COLUMN family_id SET NOT NULL;
