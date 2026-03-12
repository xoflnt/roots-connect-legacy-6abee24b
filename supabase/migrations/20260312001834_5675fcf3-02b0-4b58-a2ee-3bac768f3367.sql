
-- Family Members table
CREATE TABLE public.family_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M','F')),
  father_id TEXT REFERENCES public.family_members(id),
  birth_year TEXT,
  death_year TEXT,
  spouses TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read family_members" ON public.family_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert family_members" ON public.family_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update family_members" ON public.family_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Family Requests table
CREATE TABLE public.family_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  target_member_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.family_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read family_requests" ON public.family_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert family_requests" ON public.family_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update family_requests" ON public.family_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Verified Users table
CREATE TABLE public.verified_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL UNIQUE,
  member_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  hijri_birth_date TEXT,
  verified_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.verified_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read verified_users" ON public.verified_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert verified_users" ON public.verified_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update verified_users" ON public.verified_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Visit Stats table (single-row counter)
CREATE TABLE public.visit_stats (
  id INT PRIMARY KEY DEFAULT 1,
  count INT NOT NULL DEFAULT 0
);
ALTER TABLE public.visit_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visit_stats" ON public.visit_stats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public update visit_stats" ON public.visit_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
INSERT INTO public.visit_stats (id, count) VALUES (1, 0);
