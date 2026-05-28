DROP POLICY IF EXISTS "Clientes podem criar pedidos validos" ON public.pedidos;

CREATE POLICY "Clientes podem criar pedidos validos"
ON public.pedidos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'novo'::text
  AND valor_total IS NULL
  AND observacoes_admin IS NULL
  AND length(trim(nome_cliente)) > 0
  AND length(trim(telefone)) > 0
  AND length(trim(endereco)) > 0
  AND data_evento IS NOT NULL
  AND horario_evento IS NOT NULL
  AND tipo_logistica IN ('retirada', 'entrega')
  AND (
    (tipo_logistica = 'retirada' AND data_retirada IS NOT NULL AND horario_retirada IS NOT NULL)
    OR
    (tipo_logistica = 'entrega' AND endereco_entrega IS NOT NULL AND length(trim(endereco_entrega)) > 0 AND data_entrega IS NOT NULL AND horario_entrega IS NOT NULL)
  )
  AND jsonb_typeof(itens) = 'array'
  AND jsonb_array_length(itens) > 0
  AND coalesce(array_length(inspiracao_urls, 1), 0) <= 10
);