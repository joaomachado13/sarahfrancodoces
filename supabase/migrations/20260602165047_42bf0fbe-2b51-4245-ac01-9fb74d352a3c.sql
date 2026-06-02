GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Admins podem listar inspiracoes" ON storage.objects;
CREATE POLICY "Admins podem listar inspiracoes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Inspiracoes admin update" ON storage.objects;
CREATE POLICY "Inspiracoes admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'pedido-inspiracoes'
  AND public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Inspiracoes admin delete" ON storage.objects;
CREATE POLICY "Inspiracoes admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND public.has_role(auth.uid(), 'admin')
);