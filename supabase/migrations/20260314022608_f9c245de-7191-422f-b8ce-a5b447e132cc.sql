
-- ═══════════════════════════════════
-- SECURITY RLS LOCKDOWN + admin_sessions table
-- ═══════════════════════════════════

-- ─── family_members ───
DROP POLICY IF EXISTS "Allow public delete family_members" ON family_members;
DROP POLICY IF EXISTS "Public insert family_members" ON family_members;
DROP POLICY IF EXISTS "Public read family_members" ON family_members;
DROP POLICY IF EXISTS "Public update family_members" ON family_members;

CREATE POLICY "public_read_family_members" ON family_members
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "block_anon_insert_family_members" ON family_members
FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "block_anon_update_family_members" ON family_members
FOR UPDATE TO anon, authenticated USING (false);

CREATE POLICY "block_anon_delete_family_members" ON family_members
FOR DELETE TO anon, authenticated USING (false);

-- ─── verified_users ───
DROP POLICY IF EXISTS "Public insert verified_users" ON verified_users;
DROP POLICY IF EXISTS "Public read verified_users" ON verified_users;
DROP POLICY IF EXISTS "Public update verified_users" ON verified_users;

CREATE POLICY "block_all_select_verified_users" ON verified_users
FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY "block_all_insert_verified_users" ON verified_users
FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "block_all_update_verified_users" ON verified_users
FOR UPDATE TO anon, authenticated USING (false);

-- ─── family_requests ───
DROP POLICY IF EXISTS "Public insert family_requests" ON family_requests;
DROP POLICY IF EXISTS "Public read family_requests" ON family_requests;
DROP POLICY IF EXISTS "Public update family_requests" ON family_requests;

CREATE POLICY "anon_insert_family_requests" ON family_requests
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "block_read_family_requests" ON family_requests
FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY "block_update_family_requests" ON family_requests
FOR UPDATE TO anon, authenticated USING (false);

-- ─── visit_stats ───
DROP POLICY IF EXISTS "Public read visit_stats" ON visit_stats;
DROP POLICY IF EXISTS "Public update visit_stats" ON visit_stats;

CREATE POLICY "public_read_visit_stats" ON visit_stats
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "block_update_visit_stats" ON visit_stats
FOR UPDATE TO anon, authenticated USING (false);

-- ─── document_likes ───
DROP POLICY IF EXISTS "Public delete document_likes" ON document_likes;
DROP POLICY IF EXISTS "Public insert document_likes" ON document_likes;
DROP POLICY IF EXISTS "Public read document_likes" ON document_likes;

CREATE POLICY "public_read_document_likes" ON document_likes
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_document_likes" ON document_likes
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "block_update_document_likes" ON document_likes
FOR UPDATE TO anon, authenticated USING (false);

CREATE POLICY "block_delete_document_likes" ON document_likes
FOR DELETE TO anon, authenticated USING (false);

-- ─── document_comments ───
DROP POLICY IF EXISTS "Public insert document_comments" ON document_comments;
DROP POLICY IF EXISTS "Public read document_comments" ON document_comments;

CREATE POLICY "public_read_document_comments" ON document_comments
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_document_comments" ON document_comments
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "block_update_document_comments" ON document_comments
FOR UPDATE TO anon, authenticated USING (false);

CREATE POLICY "block_delete_document_comments" ON document_comments
FOR DELETE TO anon, authenticated USING (false);

-- ─── otp_verifications (tighten SELECT) ───
DROP POLICY IF EXISTS "Allow public select own" ON otp_verifications;

CREATE POLICY "block_anon_select_otp" ON otp_verifications
FOR SELECT TO anon, authenticated USING (false);

-- ─── admin_sessions (new table) ───
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no_client_access_admin_sessions" ON admin_sessions
FOR ALL TO anon, authenticated USING (false);
