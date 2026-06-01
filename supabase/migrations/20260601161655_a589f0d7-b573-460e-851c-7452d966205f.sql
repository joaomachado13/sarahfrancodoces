-- 1) Make inspiration bucket private + tighten size/mime
UPDATE storage.buckets
SET public = false,
    file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/heic']
WHERE id = 'pedido-inspiracoes';

-- 2) Replace open INSERT policy with one scoping uploads to "incoming/" prefix
DROP POLICY IF EXISTS "Inspiracoes upload publico" ON storage.objects;

CREATE POLICY "Inspiracoes upload restrito"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'pedido-inspiracoes'
  AND (storage.foldername(name))[1] = 'incoming'
);

-- Admin UPDATE policy (was missing)
CREATE POLICY "Inspiracoes admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'pedido-inspiracoes'
  AND public.has_role(auth.uid(), 'admin')
);

-- 3) Lock down realtime.messages so only admins can subscribe to channels
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read realtime messages" ON realtime.messages;
CREATE POLICY "Admins can read realtime messages"
ON realtime.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can write realtime messages" ON realtime.messages;
CREATE POLICY "Admins can write realtime messages"
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
