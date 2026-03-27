-- ═══════════════════════════════════════════════════════════
-- Multi-tenant: add family_id to all remaining tenant-scoped tables
-- Skipped: family_members (already done), admin_sessions (global),
--          visit_stats (global counter), otp_verifications (global)
-- ═══════════════════════════════════════════════════════════

-- ─── 1. verified_users ───
ALTER TABLE public.verified_users
  ADD COLUMN family_id UUID REFERENCES public.families(id);

UPDATE public.verified_users
SET family_id = (SELECT id FROM public.families WHERE slug = 'khunaini');

CREATE INDEX idx_verified_users_family_id ON public.verified_users(family_id);

-- ─── 2. family_requests ───
ALTER TABLE public.family_requests
  ADD COLUMN family_id UUID REFERENCES public.families(id);

UPDATE public.family_requests
SET family_id = (SELECT id FROM public.families WHERE slug = 'khunaini');

CREATE INDEX idx_family_requests_family_id ON public.family_requests(family_id);

-- ─── 3. document_likes ───
ALTER TABLE public.document_likes
  ADD COLUMN family_id UUID REFERENCES public.families(id);

UPDATE public.document_likes
SET family_id = (SELECT id FROM public.families WHERE slug = 'khunaini');

CREATE INDEX idx_document_likes_family_id ON public.document_likes(family_id);

-- ─── 4. document_comments ───
ALTER TABLE public.document_comments
  ADD COLUMN family_id UUID REFERENCES public.families(id);

UPDATE public.document_comments
SET family_id = (SELECT id FROM public.families WHERE slug = 'khunaini');

CREATE INDEX idx_document_comments_family_id ON public.document_comments(family_id);

-- ─── 5. push_subscriptions ───
ALTER TABLE public.push_subscriptions
  ADD COLUMN family_id UUID REFERENCES public.families(id);

UPDATE public.push_subscriptions
SET family_id = (SELECT id FROM public.families WHERE slug = 'khunaini');

CREATE INDEX idx_push_subscriptions_family_id ON public.push_subscriptions(family_id);

-- ─── 6. notifications ───
ALTER TABLE public.notifications
  ADD COLUMN family_id UUID REFERENCES public.families(id);

UPDATE public.notifications
SET family_id = (SELECT id FROM public.families WHERE slug = 'khunaini');

CREATE INDEX idx_notifications_family_id ON public.notifications(family_id);
