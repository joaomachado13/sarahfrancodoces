
## Refinamentos no formulário de pedido (`/pedido`)

Ajustes pontuais na página `Pedido.tsx`, sem alterar layout geral nem funcionalidades existentes.

### 1. Bolo — remover referência a "andares"
No campo **Tamanho** do `BoloFields`, trocar o placeholder:
- De: `Ex: 2 andares, 30 fatias...`
- Para: `Ex: 30 fatias, 2kg, 1,5kg...`

### 2. Começar pelos doces
- Etapa "Pedido" (`StepItems`) inicia com **1 doce** em vez de 1 bolo.
- Estado inicial em `Pedido.tsx`: `useState<OrderItem[]>([newDoce()])`.
- Ordem dos botões "+ adicionar" passa a ser: **Doce primeiro**, depois **Bolo** (já está nessa ordem visual, mas vou reforçar destacando o de doce como ação principal e o de bolo como secundária mais discreta).

### 3. Tipografia e contraste mais fortes no formulário
A queixa é texto "apagado". Vou aumentar contraste em:
- **Labels** (`Field`): trocar `text-petrol/70` → `text-petrol` + peso `font-medium`.
- **Inputs**: texto digitado de `text-petrol` (já ok) mantém, mas placeholder de `placeholder:text-petrol/40` → `placeholder:text-petrol/55` para ficar legível sem virar texto real.
- **Subtítulos de seção**: `text-petrol/60` → `text-petrol/80`.
- **Cabeçalho do item** (`Item 1 — Bolo`): aumentar tamanho e peso (`text-xs font-semibold`).
- **Botão remover**: `text-petrol/50` → `text-petrol/75`.

### 4. Estética mais arredondada
Aplicar bordas arredondadas consistentes (mantendo elegância, sem virar "bubbly"):
- **Inputs / textareas** (`inputCls`): adicionar `rounded-xl`.
- **Card branco principal** (container do step): `rounded-2xl`.
- **Card de cada item** (Item 1, Item 2…): `rounded-xl`.
- **Botões de modo** (Entrega / Retirada): `rounded-xl`.
- **Botões "+ adicionar doce / bolo"**: `rounded-xl`.
- **Botão Continuar / Enviar pedido**: `rounded-full` (mais premium).
- **Círculos do stepper**: já são `rounded-full`, mantém.

### 5. Esconder botão flutuante do WhatsApp na página de pedido
O `WhatsAppFloat` está sobrepondo o botão "Continuar". Solução:
- No `WhatsAppFloat.tsx`, usar `useLocation()` do `react-router-dom` e **não renderizar** o botão quando `pathname === "/pedido"` (e em qualquer rota `/admin*` por consistência).
- Retorna `null` nesses casos.

### Arquivos a editar
- `src/pages/Pedido.tsx` — placeholder do bolo, item inicial doce, classes de tipografia/contraste, `rounded-*` em inputs/cards/botões.
- `src/components/WhatsAppFloat.tsx` — esconder em `/pedido` e rotas admin.

### O que NÃO muda
- Layout geral, número de etapas, ordem das etapas, validações, schema do banco, cores principais (burgundy / petrol / cream), animações do botão WhatsApp em outras páginas.
