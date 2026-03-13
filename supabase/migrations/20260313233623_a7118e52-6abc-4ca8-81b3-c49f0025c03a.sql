
-- Document likes table
CREATE TABLE public.document_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  user_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, user_phone)
);

ALTER TABLE public.document_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read document_likes" ON public.document_likes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public insert document_likes" ON public.document_likes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public delete document_likes" ON public.document_likes
  FOR DELETE TO anon, authenticated USING (true);

-- Document comments table
CREATE TABLE public.document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  user_name text NOT NULL,
  user_phone text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read document_comments" ON public.document_comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public insert document_comments" ON public.document_comments
  FOR INSERT TO anon, authenticated WITH CHECK (true);
