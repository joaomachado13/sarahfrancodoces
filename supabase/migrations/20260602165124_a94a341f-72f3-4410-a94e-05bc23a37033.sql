DROP POLICY IF EXISTS "Admins podem listar inspiracoes" ON storage.objects;
CREATE POLICY "Admins podem listar inspiracoes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Inspiracoes admin update" ON storage.objects;
CREATE POLICY "Inspiracoes admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
)
WITH CHECK (
  bucket_id = 'pedido-inspiracoes'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Inspiracoes admin delete" ON storage.objects;
CREATE POLICY "Inspiracoes admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Admins can read realtime messages" ON realtime.messages;
CREATE POLICY "Admins can read realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Admins can write realtime messages" ON realtime.messages;
CREATE POLICY "Admins can write realtime messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO sandbox_exec;