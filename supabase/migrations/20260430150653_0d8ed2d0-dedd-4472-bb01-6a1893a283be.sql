DROP POLICY IF EXISTS "Qualquer um pode criar pedido" ON public.pedidos;

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
  AND jsonb_typeof(itens) = 'array'
  AND jsonb_array_length(itens) > 0
);