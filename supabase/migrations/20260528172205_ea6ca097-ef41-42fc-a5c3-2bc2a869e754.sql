
-- Coluna para URLs das inspirações enviadas pelo cliente
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS inspiracao_urls text[] NOT NULL DEFAULT '{}';

-- Atualiza a policy de insert para validar o novo campo (array, máx 10)
DROP POLICY IF EXISTS "Clientes podem criar pedidos validos" ON public.pedidos;
CREATE POLICY "Clientes podem criar pedidos validos"
ON public.pedidos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'novo'
  AND valor_total IS NULL
  AND observacoes_admin IS NULL
  AND length(trim(nome_cliente)) > 0
  AND length(trim(telefone)) > 0
  AND length(trim(endereco)) > 0
  AND data_evento IS NOT NULL
  AND horario_evento IS NOT NULL
  AND tipo_logistica = ANY (ARRAY['retirada','entrega'])
  AND jsonb_typeof(itens) = 'array'
  AND jsonb_array_length(itens) > 0
  AND array_length(inspiracao_urls, 1) IS NULL OR array_length(inspiracao_urls, 1) <= 10
);

-- Bucket público para inspirações dos pedidos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pedido-inspiracoes', 'pedido-inspiracoes', true)
ON CONFLICT (id) DO NOTHING;

-- Qualquer um pode ler (bucket público)
DROP POLICY IF EXISTS "Inspiracoes publicas leitura" ON storage.objects;
CREATE POLICY "Inspiracoes publicas leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'pedido-inspiracoes');

-- Qualquer um pode subir (form público de pedido)
DROP POLICY IF EXISTS "Inspiracoes upload publico" ON storage.objects;
CREATE POLICY "Inspiracoes upload publico"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'pedido-inspiracoes');

-- Admins podem apagar
DROP POLICY IF EXISTS "Inspiracoes admin delete" ON storage.objects;
CREATE POLICY "Inspiracoes admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pedido-inspiracoes'
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
