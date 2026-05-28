DROP POLICY IF EXISTS "Inspiracoes publicas leitura" ON storage.objects;

CREATE POLICY "Admins podem listar inspiracoes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND public.has_role(auth.uid(), 'admin')
);