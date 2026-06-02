DROP POLICY IF EXISTS "Inspiracoes upload restrito" ON storage.objects;

CREATE POLICY "Inspiracoes upload pedidos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'pedido-inspiracoes'
    AND (
      (storage.foldername(name))[1] = 'incoming'
      OR (storage.foldername(name))[1] = 'pedidos'
    )
  );