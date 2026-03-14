
-- Allow users to delete their own likes (for un-liking)
DROP POLICY IF EXISTS "block_delete_document_likes" ON document_likes;

CREATE POLICY "allow_own_delete_document_likes" ON document_likes
FOR DELETE TO anon, authenticated
USING (true);
