-- ═══════════════════════════════════════════════════════════
-- Multi-tenant foundation: families table + family_id on family_members
-- ═══════════════════════════════════════════════════════════

-- STEP 1: Create families table
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  passcode_hash TEXT,
  admin_password_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- SELECT public, all writes service_role only
CREATE POLICY "public_read_families" ON public.families
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "block_insert_families" ON public.families
  FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "block_update_families" ON public.families
  FOR UPDATE TO anon, authenticated USING (false);

CREATE POLICY "block_delete_families" ON public.families
  FOR DELETE TO anon, authenticated USING (false);

-- STEP 2: Add family_id column to family_members (nullable for now)
ALTER TABLE public.family_members
  ADD COLUMN family_id UUID REFERENCES public.families(id);

-- STEP 3: Seed the Khunaini family and backfill all existing rows
INSERT INTO public.families (slug, name, subdomain, is_active)
VALUES ('khunaini', 'عائلة الخنيني', 'khunaini', true);

UPDATE public.family_members
SET family_id = (SELECT id FROM public.families WHERE slug = 'khunaini');

-- STEP 4: Index for fast lookups by family_id
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
