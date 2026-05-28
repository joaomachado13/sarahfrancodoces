
# Evolução Sarah Franco — Formulário Premium, Cardápio Guiado e Orçamento Automático

Vou dividir em **4 entregas** para manter o sistema estável e revisável. Cada entrega é independente e não quebra o que já existe.

---

## Entrega 1 — Responsividade do formulário + Header inteligente

**Objetivo:** resolver a dor imediata de scroll/header pesado no mobile sem mexer em lógica.

- `Navbar.tsx`: reduzir altura no mobile (de `h-[4.5rem]` → `h-14`), logo menor, esconder ao scrollar para baixo / mostrar ao scrollar para cima (comportamento "auto-hide").
- `Pedido.tsx`: 
  - `pt-*` ajustado ao novo header, remover gap superior excessivo.
  - Inputs e cards com `rounded-xl` / `rounded-2xl` consistentes.
  - Tipografia: subir contraste de labels (`text-petrol/70` → `text-petrol font-medium`), placeholders mais legíveis.
  - Espaçamento vertical reduzido no mobile, grid 2-col em tablet+ onde fizer sentido.
  - Stepper compacto no mobile (só números + barra), expandido no desktop.
- `WhatsAppFloat`: já escondido em `/pedido` (do plano anterior — confirmar).

**Não muda:** schema, validações, fluxo de etapas, identidade visual.

---

## Entrega 2 — Cardápio interno (backend) + Admin

**Objetivo:** criar a fonte da verdade dos sabores e preços, **invisível ao cliente**.

### Banco — nova migration

```text
menu_categorias        (id, tipo, nome, ordem)    -- ex: "doce_tradicional", "bolo_massa"
menu_itens             (id, categoria_id, nome, ativo, ordem, observacoes_internas)
precos_doces           (item_id, preco_cento, preco_unitario, atualizado_em)
precos_bolos_massa     (item_id, preco_kg, atualizado_em)
precos_bolos_recheio   (item_id, acrescimo_kg)    -- recheio premium adiciona valor
precos_adicionais      (item_id, acrescimo_kg)
```

- RLS: **SELECT público** apenas em `menu_categorias` + `menu_itens` (sabores são públicos).
- RLS: **todas as tabelas `precos_*`** acessíveis somente por `admin` (has_role).
- Seed inicial com toda a lista do briefing (massas, coberturas, recheios, adicionais, doces tradicionais/gourmet/finos) + dados do PDF anexado.

### Admin — nova aba "Cardápio Interno"

- CRUD de itens por categoria.
- Edição inline de preços (`R$/kg` para bolos, `R$/cento` e `R$/un` para doces).
- Toggle ativo/inativo (some do formulário do cliente sem deletar).

---

## Entrega 3 — Formulário guiado por cardápio

**Objetivo:** trocar campos livres por seletores estruturados.

### Bolos — "Monte seu bolo"
- Seletor de **massa** (radio cards com nome).
- Seletor de **cobertura** (radio cards).
- Multi-select de **recheios** (até N camadas).
- Multi-select de **adicionais** (morango, nutella, etc.).
- Campos: peso estimado (kg), quantidade, observações.
- **Sem preço visível.**

### Doces — categorias colapsáveis
- Accordion: Tradicionais / Gourmet / Finos.
- Cada sabor: checkbox + qtd + cor da forminha + obs.
- Resumo lateral (no desktop) / inferior (no mobile) mostrando "X sabores, Y unidades totais" — **sem valores**.

### Estrutura de dados do pedido
`itens` (jsonb) passa a guardar `item_id` (referência ao cardápio) além do nome — permite recálculo se preço mudar. Mantém compatibilidade com pedidos antigos (campos `sabores`, `massa` etc. continuam aceitos).

---

## Entrega 4 — Orçamento automático + PDF dual

### Cálculo automático (Admin)
- Edge function `calcular-orcamento`: recebe `pedido_id`, cruza itens com tabelas de preço, retorna composição detalhada (linha a linha + total).
- No dashboard, ao abrir pedido: mostra "Orçamento sugerido: R$ X" com breakdown.
- Sarah pode **ajustar manualmente** (`valor_total` editável) e adicionar nota interna.

### PDF de orçamento — duas versões
- **PDF cliente** (`generatePedidoPdf` — já existe, refinar): só itens, descrição e **valor final** consolidado.
- **PDF admin** (novo): breakdown completo — preço/kg, preço/cento, margem estimada, composição.
- Botões separados no admin: "Baixar para cliente" / "Baixar interno".

---

## Stack técnica

- Banco: Supabase (migrations + RLS).
- Frontend: componentes novos em `src/components/pedido/menu/` (BoloBuilder, DocesPicker) e `src/components/admin/cardapio/`.
- PDF: continuar com `pdf-lib` / o gerador atual.
- Sem novas dependências grandes.

---

## O que NÃO muda

- Identidade visual (bordô / petróleo / cream, Cormorant + Inter).
- Estrutura de etapas do formulário (cliente → evento → itens → logística → revisão).
- Endpoints existentes (`send-pedido-email`, `sync-pedido-sheets`).
- Schema dos pedidos antigos (retrocompatível).

---

## Ordem sugerida de execução

1. **Entrega 1** primeiro (rápida, alto impacto visível).
2. Depois confirmamos antes de seguir para a 2 (migration + admin).
3. Entrega 3 depende da 2.
4. Entrega 4 fecha o ciclo.

**Posso começar pela Entrega 1 agora?** Ou prefere que eu já dispare a migration da Entrega 2 em paralelo?
