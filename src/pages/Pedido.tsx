import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-sarah-franco.png";
import { SEO } from "@/components/SEO";
import {
  CustomerData,
  EventData,
  LogisticsData,
  OrderItem,
  newBolo,
  newDoce,
  DoceItem,
  BoloItem,
} from "@/types/order";

const pedidoSchema = z.object({
  nome_cliente: z.string().trim().min(1).max(120),
  telefone: z.string().trim().min(8).max(30),
  endereco: z.string().trim().min(1).max(300),
  data_evento: z.string().min(1),
  horario_evento: z.string().min(1),
  tipo_logistica: z.enum(["entrega", "retirada"]),
  endereco_entrega: z.string().max(300).nullable(),
  data_entrega: z.string().nullable(),
  horario_entrega: z.string().nullable(),
  data_retirada: z.string().nullable(),
  horario_retirada: z.string().nullable(),
  itens: z.array(z.any()).min(1),
  inspiracao_urls: z.array(z.string().url()).max(10).optional(),
});

const stepLabels = ["Você", "Evento", "Entrega", "Pedido", "Revisão"];

/* ===== Cardápio oficial Sarah Franco ===== */
const MASSAS_BOLO = ["Chocolate", "Baunilha"];

const COBERTURAS_BOLO = [
  "Chantilly",
  "Chantininho",
  "Ganache ao leite",
  "Ganache meio amargo",
];

const RECHEIOS_BOLO = [
  "Brigadeiro",
  "Mulatinho",
  "Trufado de Maracujá",
  "Abacaxi com Coco",
  "Choconinho",
  "Leite Ninho",
  "Prestígio",
  "Doce de Leite com Ameixa",
  "Olho de Sogra",
  "Floresta Negra",
  "Camafeu de Nozes",
  "Pistache com Frutas Vermelhas",
];

const ADICIONAIS_BOLO = [
  "Morango",
  "Nutella",
  "Crocante (Praliné de Castanha de Caju)",
  "Uva Verde",
];

const DOCES_TRADICIONAIS = [
  "Brigadeiro",
  "Beijinho",
  "Cajuzinho",
  "Brigadeiro de Ninho",
];

const DOCES_GOURMET = [
  "Brigadeiro Gourmet",
  "Leite Ninho",
  "Brigadeiro de Ninho com Nutella",
  "Brigadeiro Crocante",
  "Paçoca",
  "Churros",
  "Mulatinho",
  "Casadinho",
  "Olho de Sogra",
  "Brigadeiro de Morango",
  "Oreo",
  "Leite Ninho com Nutella",
  "Ferrero",
  "Caramelo Salgado",
  "Pistache",
  "Crème Brûlée",
  "Olho de Sogro",
  "Nozes",
];

const DOCES_FINOS = [
  "Mousse de Maracujá",
  "Mousse de Limão",
  "Mousse de Ninho",
  "Brigadeiro Branco com Morango/Uva",
  "Ganache ao Leite ou Meio Amargo",
  "Brigadeiro Branco/ao Leite com Cereja ou Physalis",
  "Brigadeiro de Pistache com Geleia de Frutas Vermelhas",
];

const DOCES_CATEGORIAS: { titulo: string; itens: string[] }[] = [
  { titulo: "Tradicionais", itens: DOCES_TRADICIONAIS },
  { titulo: "Gourmet", itens: DOCES_GOURMET },
  { titulo: "Finos", itens: DOCES_FINOS },
];

/* forminha e tamanho do bolo viraram texto livre */

const Pedido = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [cliente, setCliente] = useState<CustomerData>({
    nome: "",
    telefone: "",
    endereco: "",
  });
  const [evento, setEvento] = useState<EventData>({ data: "", horario: "" });
  const [logistica, setLogistica] = useState<LogisticsData>({
    modo: "entrega",
    entrega: { endereco: "", data: "", horario: "" },
    retirada: { data: "", horario: "" },
  });
  const [itens, setItens] = useState<OrderItem[]>([newDoce()]);
  const [inspiracoes, setInspiracoes] = useState<string[]>([]);

  const updateItem = (id: string, patch: Partial<OrderItem>) => {
    setItens((prev) =>
      prev.map((it) => (it.id === id ? ({ ...it, ...patch } as OrderItem) : it))
    );
  };

  const removeItem = (id: string) =>
    setItens((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  const next = () => {
    // Validações leves por etapa
    if (step === 0) {
      if (!cliente.nome.trim() || !cliente.telefone.trim() || !cliente.endereco.trim()) {
        toast.error("Preencha todos os dados de cadastro.");
        return;
      }
    }
    if (step === 1) {
      if (!evento.data || !evento.horario) {
        toast.error("Informe data e horário do evento.");
        return;
      }
    }
    if (step === 2) {
      if (logistica.modo === "entrega") {
        const e = logistica.entrega!;
        if (!e.endereco || !e.data || !e.horario) {
          toast.error("Preencha os dados de entrega.");
          return;
        }
      } else {
        const r = logistica.retirada!;
        if (!r.data || !r.horario) {
          toast.error("Preencha os dados de retirada.");
          return;
        }
      }
    }
    if (step === 3) {
      if (itens.length === 0) {
        toast.error("Adicione ao menos um item.");
        return;
      }
      for (const [i, it] of itens.entries()) {
        const tag = `Item ${i + 1}`;
        if (it.tipo === "doce") {
          if (!it.quantidade || it.quantidade < 1) {
            toast.error(`${tag}: informe a quantidade.`);
            return;
          }
          if (!it.sabor) {
            toast.error(`${tag}: escolha o sabor.`);
            return;
          }
          if (!it.corForminha.trim()) {
            toast.error(`${tag}: informe a cor da forminha.`);
            return;
          }
        } else {
          if (!it.tamanho.trim()) { toast.error(`${tag}: informe o tamanho do bolo (em kg).`); return; }
          if (!it.massa) { toast.error(`${tag}: escolha a massa.`); return; }
          if (!it.recheio) {
            toast.error(`${tag}: escolha o recheio.`);
            return;
          }
          if (!it.cobertura) { toast.error(`${tag}: escolha a cobertura.`); return; }
        }
      }
    }
    setStep((s) => Math.min(s + 1, stepLabels.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [enviando, setEnviando] = useState(false);

  const submit = async () => {
    const pedidoId = crypto.randomUUID();
    const payload = {
      nome_cliente: cliente.nome,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      data_evento: evento.data,
      horario_evento: evento.horario,
      tipo_logistica: logistica.modo,
      endereco_entrega: logistica.modo === "entrega" ? logistica.entrega?.endereco ?? null : null,
      data_entrega: logistica.modo === "entrega" ? logistica.entrega?.data ?? null : null,
      horario_entrega: logistica.modo === "entrega" ? logistica.entrega?.horario ?? null : null,
      data_retirada: logistica.modo === "retirada" ? logistica.retirada?.data ?? null : null,
      horario_retirada: logistica.modo === "retirada" ? logistica.retirada?.horario ?? null : null,
      itens,
      inspiracao_urls: inspiracoes,
    };

    const parsed = pedidoSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Verifique os dados do pedido antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase
        .from("pedidos")
        .insert({ id: pedidoId, ...parsed.data } as any);
      if (error) throw error;

      const pedidoCriado = {
        id: pedidoId,
        ...parsed.data,
        status: "novo",
        observacoes_admin: null,
        created_at: new Date().toISOString(),
      };

      // Dispara notificação por email — não bloqueia o fluxo se falhar
      supabase.functions
        .invoke("send-pedido-email", { body: pedidoCriado })
        .then(({ error: emailError }) => {
          if (emailError) {
            console.error("Falha ao enviar email do pedido:", emailError);
          }
        })
        .catch((e) => console.error("Falha ao enviar email do pedido:", e));

      // Sincroniza com Google Sheets — não bloqueia o fluxo se falhar
      supabase.functions
        .invoke("sync-pedido-sheets", {
          body: {
            id: pedidoCriado.id,
            nome_cliente: pedidoCriado.nome_cliente,
            telefone: pedidoCriado.telefone,
            tipo_logistica: pedidoCriado.tipo_logistica,
            data_evento: pedidoCriado.data_evento,
            itens: pedidoCriado.itens,
            status: pedidoCriado.status,
            observacoes_admin: pedidoCriado.observacoes_admin,
            created_at: pedidoCriado.created_at,
          },
        })
        .then(({ error: sheetsError }) => {
          if (sheetsError) {
            console.error("Falha ao sincronizar com Sheets:", sheetsError);
          }
        })
        .catch((e) => console.error("Falha ao sincronizar com Sheets:", e));

      toast.success("Pedido enviado! Entraremos em contato em breve.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      toast.error("Erro ao enviar pedido: " + (err.message || "tente novamente"));
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Solicitar Orçamento — Sarah Franco Doces & Bolos"
        description="Monte seu pedido de bolos e doces artesanais personalizados. Receba um orçamento sob medida para o seu evento."
        path="/pedido"
      />
      {/* Top bar — compacta e sticky */}
      <header className="sticky top-0 z-40 border-b border-burgundy/15 bg-cream/90 backdrop-blur-md">
        <div className="container-narrow flex h-14 items-center justify-between md:h-16">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Sarah Franco"
              className="h-7 w-auto md:h-8"
              style={{ filter: "brightness(0.4) sepia(1) hue-rotate(-20deg) saturate(6)" }}
            />
          </Link>
          <Link
            to="/"
            className="text-[0.65rem] uppercase tracking-[0.22em] text-petrol/70 hover:text-burgundy md:text-xs md:tracking-[0.25em]"
          >
            ← voltar
          </Link>
        </div>
      </header>

      <div className="container-narrow py-6 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Title */}
          <div className="text-center">
            <span className="eyebrow">Solicitar orçamento</span>
            <h1 className="mt-4 font-serif text-3xl leading-tight text-petrol md:mt-6 md:text-5xl">
              Vamos montar seu <span className="font-script text-burgundy">pedido</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-petrol/75 md:mt-5 md:text-base">
              Descreva seu pedido do jeitinho que você imagina — quanto mais
              detalhes, mais personalizado fica o seu orçamento.
            </p>
          </div>

          {/* Stepper */}
          <ol className="mt-6 grid grid-cols-5 gap-1.5 md:mt-12 md:gap-4">
            {stepLabels.map((label, i) => (
              <li key={label} className="flex flex-col items-center gap-1.5 md:gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.7rem] transition-all md:h-9 md:w-9 md:text-xs ${
                    i <= step
                      ? "border-burgundy bg-burgundy text-cream"
                      : "border-burgundy/30 bg-transparent text-petrol/50"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`hidden text-[0.6rem] uppercase tracking-[0.2em] sm:block md:text-[0.65rem] ${
                    i <= step ? "text-burgundy" : "text-petrol/50"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`text-[0.55rem] uppercase tracking-[0.15em] sm:hidden ${
                    i === step ? "text-burgundy" : "text-transparent"
                  }`}
                >
                  {i === step ? label : "."}
                </span>
              </li>
            ))}
          </ol>

          {/* Card */}
          <div className="mt-6 rounded-2xl border border-burgundy/15 bg-cream p-5 shadow-soft md:mt-12 md:p-12">
            {step === 0 && (
              <StepCustomer cliente={cliente} setCliente={setCliente} />
            )}
            {step === 1 && <StepEvent evento={evento} setEvento={setEvento} />}
            {step === 2 && (
              <StepLogistics logistica={logistica} setLogistica={setLogistica} />
            )}
            {step === 3 && (
              <StepItems
                itens={itens}
                setItens={setItens}
                updateItem={updateItem}
                removeItem={removeItem}
              />
            )}
            {step === 4 && (
              <StepReview
                cliente={cliente}
                evento={evento}
                logistica={logistica}
                itens={itens}
                inspiracoes={inspiracoes}
                setInspiracoes={setInspiracoes}
              />
            )}

            {/* Nav buttons */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-burgundy/15 pt-6 md:mt-10 md:pt-8">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="text-[0.65rem] uppercase tracking-[0.22em] text-petrol/80 transition-colors hover:text-burgundy disabled:opacity-30 md:text-xs md:tracking-[0.25em]"
              >
                ← Voltar
              </button>
              {step < stepLabels.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="group inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3 text-[0.65rem] uppercase tracking-[0.22em] text-cream shadow-soft transition-all duration-500 hover:bg-burgundy-deep hover:shadow-elegant md:gap-3 md:px-8 md:py-3.5 md:text-xs md:tracking-[0.25em]"
                >
                  Continuar
                  <span className="transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={enviando}
                  className="group inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3 text-[0.65rem] uppercase tracking-[0.22em] text-cream shadow-soft transition-all duration-500 hover:bg-burgundy-deep hover:shadow-elegant disabled:opacity-50 md:gap-3 md:px-8 md:py-3.5 md:text-xs md:tracking-[0.25em]"
                >
                  {enviando ? "Enviando..." : "Enviar pedido"}
                  <span className="transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Sub-componentes ---------- */

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-petrol">
      {label}
    </span>
    {children}
  </label>
);

const inputCls =
  "w-full rounded-xl border border-burgundy/25 bg-background px-4 py-3 text-sm text-petrol placeholder:text-petrol/55 transition-colors focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15";

const StepCustomer = ({
  cliente,
  setCliente,
}: {
  cliente: CustomerData;
  setCliente: (c: CustomerData) => void;
}) => (
  <div className="space-y-6">
    <SectionTitle title="Seus dados" subtitle="Para entrarmos em contato e personalizar seu orçamento." />
    <Field label="Nome completo">
      <input
        className={inputCls}
        value={cliente.nome}
        onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
        placeholder="Como devemos chamar você?"
      />
    </Field>
    <Field label="Telefone (WhatsApp)">
      <input
        className={inputCls}
        value={cliente.telefone}
        onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
        placeholder="(00) 00000-0000"
      />
    </Field>
    <Field label="Endereço">
      <input
        className={inputCls}
        value={cliente.endereco}
        onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
        placeholder="Rua, número, bairro, cidade"
      />
    </Field>
  </div>
);

const StepEvent = ({
  evento,
  setEvento,
}: {
  evento: EventData;
  setEvento: (e: EventData) => void;
}) => (
  <div className="space-y-6">
    <SectionTitle title="Sobre o evento" subtitle="Quando será o grande dia?" />
    <div className="grid gap-6 md:grid-cols-2">
      <Field label="Data do evento">
        <input
          type="date"
          className={inputCls}
          value={evento.data}
          onChange={(e) => setEvento({ ...evento, data: e.target.value })}
        />
      </Field>
      <Field label="Horário">
        <input
          type="time"
          className={inputCls}
          value={evento.horario}
          onChange={(e) => setEvento({ ...evento, horario: e.target.value })}
        />
      </Field>
    </div>
  </div>
);

const StepLogistics = ({
  logistica,
  setLogistica,
}: {
  logistica: LogisticsData;
  setLogistica: (l: LogisticsData) => void;
}) => (
  <div className="space-y-8">
    <SectionTitle
      title="Logística"
      subtitle="Você prefere retirar conosco ou receber por entrega?"
    />

    <div className="grid grid-cols-2 gap-3">
      {(["entrega", "retirada"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setLogistica({ ...logistica, modo: mode })}
          className={`rounded-xl border px-6 py-5 text-sm font-medium uppercase tracking-[0.2em] transition-all ${
            logistica.modo === mode
              ? "border-burgundy bg-burgundy text-cream shadow-soft"
              : "border-burgundy/30 bg-background text-petrol hover:border-burgundy hover:bg-burgundy/5"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>

    {logistica.modo === "entrega" ? (
      <div className="space-y-6">
        <Field label="Endereço de entrega">
          <input
            className={inputCls}
            value={logistica.entrega?.endereco || ""}
            onChange={(e) =>
              setLogistica({
                ...logistica,
                entrega: { ...logistica.entrega!, endereco: e.target.value },
              })
            }
            placeholder="Local da entrega"
          />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Data da entrega">
            <input
              type="date"
              className={inputCls}
              value={logistica.entrega?.data || ""}
              onChange={(e) =>
                setLogistica({
                  ...logistica,
                  entrega: { ...logistica.entrega!, data: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Horário">
            <input
              type="time"
              className={inputCls}
              value={logistica.entrega?.horario || ""}
              onChange={(e) =>
                setLogistica({
                  ...logistica,
                  entrega: { ...logistica.entrega!, horario: e.target.value },
                })
              }
            />
          </Field>
        </div>
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Data da retirada">
          <input
            type="date"
            className={inputCls}
            value={logistica.retirada?.data || ""}
            onChange={(e) =>
              setLogistica({
                ...logistica,
                retirada: { ...logistica.retirada!, data: e.target.value },
              })
            }
          />
        </Field>
        <Field label="Horário">
          <input
            type="time"
            className={inputCls}
            value={logistica.retirada?.horario || ""}
            onChange={(e) =>
              setLogistica({
                ...logistica,
                retirada: { ...logistica.retirada!, horario: e.target.value },
              })
            }
          />
        </Field>
      </div>
    )}
  </div>
);

const StepItems = ({
  itens,
  setItens,
  updateItem,
  removeItem,
}: {
  itens: OrderItem[];
  setItens: (i: OrderItem[]) => void;
  updateItem: (id: string, patch: Partial<OrderItem>) => void;
  removeItem: (id: string) => void;
}) => (
  <div className="space-y-8">
    <SectionTitle
      title="Seu pedido"
      subtitle="Adicione quantos itens quiser. Sem catálogos, sem limites de sabor."
    />

    <div className="space-y-6">
      {itens.map((item, idx) => (
        <div
          key={item.id}
          className="rounded-xl border border-burgundy/20 bg-background p-4 shadow-sm md:p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-burgundy">
              Item {idx + 1} — {item.tipo === "doce" ? "Doces" : "Bolo"}
            </p>
            {itens.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-petrol/75 transition-colors hover:bg-burgundy/10 hover:text-burgundy"
              >
                remover
              </button>
            )}
          </div>

          <div className="mt-6">
            {item.tipo === "doce" ? (
              <DoceFields item={item} updateItem={updateItem} />
            ) : (
              <BoloFields item={item} updateItem={updateItem} />
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-3 border-t border-burgundy/15 pt-6 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setItens([...itens, newDoce()])}
        className="rounded-xl border border-burgundy bg-burgundy/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-burgundy transition-all hover:bg-burgundy hover:text-cream hover:shadow-soft"
      >
        + adicionar doce
      </button>
      <button
        type="button"
        onClick={() => setItens([...itens, newBolo()])}
        className="rounded-xl border border-burgundy/40 bg-transparent px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-burgundy transition-all hover:border-burgundy hover:bg-burgundy hover:text-cream hover:shadow-soft"
      >
        + adicionar bolo
      </button>
    </div>
  </div>
);

const DoceFields = ({
  item,
  updateItem,
}: {
  item: DoceItem;
  updateItem: (id: string, patch: Partial<OrderItem>) => void;
}) => {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Quantidade *">
          <input
            type="number"
            min={1}
            className={inputCls}
            value={item.quantidade}
            onChange={(e) => updateItem(item.id, { quantidade: Number(e.target.value) })}
          />
        </Field>
        <Field label="Cor da forminha *">
          <input
            className={inputCls}
            value={item.corForminha}
            onChange={(e) => updateItem(item.id, { corForminha: e.target.value })}
            placeholder="Ex.: dourada, rosé, branca…"
          />
        </Field>
      </div>
      <Field label="Sabor *">
        <PickerButton
          value={item.sabor}
          placeholder="Escolher sabor"
          groups={DOCES_CATEGORIAS.map((c) => ({ titulo: c.titulo, itens: c.itens }))}
          onPick={(v) => updateItem(item.id, { sabor: v })}
          title="Escolha um sabor"
        />
      </Field>
      <Field label="Observações (opcional)">
        <textarea
          rows={2}
          className={inputCls + " resize-none"}
          value={item.observacoes}
          onChange={(e) => updateItem(item.id, { observacoes: e.target.value })}
          placeholder="Restrições, preferências, etc."
        />
      </Field>
    </div>
  );
};

const BoloFields = ({
  item,
  updateItem,
}: {
  item: BoloItem;
  updateItem: (id: string, patch: Partial<OrderItem>) => void;
}) => {
  return (
    <div className="space-y-5">
      <Field label="Tamanho do bolo * (em kg)">
        <input
          className={inputCls}
          value={item.tamanho}
          onChange={(e) => updateItem(item.id, { tamanho: e.target.value })}
          placeholder="Ex.: 3 kg, 5 kg, 10 kg…"
        />
      </Field>
      <Field label="Massa *">
        <ChipGroup
          options={MASSAS_BOLO}
          selected={item.massa ? [item.massa] : []}
          onToggle={(v) => updateItem(item.id, { massa: v })}
          single
        />
      </Field>
      <Field label="Recheio *">
        <PickerButton
          value={item.recheio}
          placeholder="Escolher recheio"
          groups={[{ titulo: "Recheios", itens: RECHEIOS_BOLO }]}
          onPick={(v) => updateItem(item.id, { recheio: v })}
          title="Escolha um recheio"
        />
      </Field>
      <Field label="Cobertura *">
        <PickerButton
          value={item.cobertura}
          placeholder="Escolher cobertura"
          groups={[{ titulo: "Coberturas", itens: COBERTURAS_BOLO }]}
          onPick={(v) => updateItem(item.id, { cobertura: v })}
          title="Escolha uma cobertura"
        />
      </Field>
      <Field label="Adicional (opcional)">
        <PickerButton
          value={item.adicional}
          placeholder="Nenhum"
          groups={[{ titulo: "Adicionais", itens: ADICIONAIS_BOLO }]}
          onPick={(v) => updateItem(item.id, { adicional: v })}
          title="Escolha um adicional"
          allowClear
        />
      </Field>
      <Field label="Observações (opcional)">
        <textarea
          rows={3}
          className={inputCls + " resize-none"}
          value={item.observacoes}
          onChange={(e) => updateItem(item.id, { observacoes: e.target.value })}
          placeholder="Decoração, topo de bolo, paleta de cores..."
        />
      </Field>
    </div>
  );
};

/* ===== Chip selector (single ou multi) ===== */
const ChipGroup = ({
  options,
  selected,
  onToggle,
  single = false,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  single?: boolean;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const isOn = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          aria-pressed={isOn}
          className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all md:text-sm ${
            isOn
              ? "border-burgundy bg-burgundy text-cream shadow-soft"
              : "border-burgundy/30 bg-background text-petrol hover:border-burgundy hover:bg-burgundy/5"
          }`}
        >
          {single && isOn ? "✓ " : ""}{opt}
        </button>
      );
    })}
  </div>
);

const StepReview = ({
  cliente,
  evento,
  logistica,
  itens,
  inspiracoes,
  setInspiracoes,
}: {
  cliente: CustomerData;
  evento: EventData;
  logistica: LogisticsData;
  itens: OrderItem[];
  inspiracoes: string[];
  setInspiracoes: React.Dispatch<React.SetStateAction<string[]>>;
}) => (
  <div className="space-y-8">
    <SectionTitle
      title="Confira seu pedido"
      subtitle="Revise os detalhes antes de enviar."
    />
    <ReviewBlock title="Cliente">
      <p>{cliente.nome}</p>
      <p>{cliente.telefone}</p>
      <p>{cliente.endereco}</p>
    </ReviewBlock>
    <ReviewBlock title="Evento">
      <p>
        {evento.data} às {evento.horario}
      </p>
    </ReviewBlock>
    <ReviewBlock title={logistica.modo === "entrega" ? "Entrega" : "Retirada"}>
      {logistica.modo === "entrega" ? (
        <>
          <p>{logistica.entrega?.endereco}</p>
          <p>
            {logistica.entrega?.data} às {logistica.entrega?.horario}
          </p>
        </>
      ) : (
        <p>
          {logistica.retirada?.data} às {logistica.retirada?.horario}
        </p>
      )}
    </ReviewBlock>
    <ReviewBlock title={`Itens (${itens.length})`}>
      <ul className="space-y-3">
        {itens.map((it, i) => (
          <li key={it.id} className="border-l-2 border-burgundy pl-4">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-burgundy">
              {i + 1} — {it.tipo}
            </p>
            {it.tipo === "doce" ? (
              <p className="mt-1 text-sm text-petrol/80">
                {it.quantidade} unid. · forminha {it.corForminha || "—"} · {it.sabor || "(sabor a definir)"}
              </p>
            ) : (
              <p className="mt-1 text-sm text-petrol/80">
                {it.tamanho} · {it.massa} / {it.recheio || "—"} / {it.cobertura}
                {it.adicional ? ` + ${it.adicional}` : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </ReviewBlock>
    <ReviewBlock title="Inspirações (opcional)">
      <InspiracoesUploader urls={inspiracoes} setUrls={setInspiracoes} />
    </ReviewBlock>
  </div>
);

const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div>
    <h2 className="font-serif text-2xl text-petrol md:text-3xl">{title}</h2>
    <p className="mt-1.5 text-sm text-petrol/80 md:mt-2">{subtitle}</p>
  </div>
);

const ReviewBlock = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border-t border-burgundy/15 pt-5">
    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-burgundy/80">
      {title}
    </p>
    <div className="mt-2 space-y-1 text-sm text-petrol/80">{children}</div>
  </div>
);

export default Pedido;

/* ===== Picker modal (single-select com grupos) ===== */
const PickerButton = ({
  value,
  placeholder,
  groups,
  onPick,
  title,
  allowClear = false,
}: {
  value: string;
  placeholder: string;
  groups: { titulo: string; itens: string[] }[];
  onPick: (v: string) => void;
  title: string;
  allowClear?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
          value
            ? "border-burgundy bg-burgundy/5 text-petrol"
            : "border-burgundy/25 bg-background text-petrol/55 hover:border-burgundy"
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <span className="ml-3 text-[0.65rem] uppercase tracking-[0.22em] text-burgundy">
          {value ? "trocar" : "escolher"}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-petrol/40 backdrop-blur-sm md:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-burgundy/15 bg-cream shadow-elegant md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-burgundy/15 px-5 py-4">
              <h3 className="font-serif text-lg text-petrol">{title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[0.65rem] uppercase tracking-[0.22em] text-petrol/70 hover:text-burgundy"
              >
                fechar ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {groups.map((g) => (
                <div key={g.titulo} className="mb-4 last:mb-0">
                  {groups.length > 1 && (
                    <p className="mb-2 text-[0.65rem] uppercase tracking-[0.22em] text-burgundy/80">
                      {g.titulo}
                    </p>
                  )}
                  <div className="flex flex-col gap-1.5">
                    {g.itens.map((opt) => {
                      const active = value === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            onPick(opt);
                            setOpen(false);
                          }}
                          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                            active
                              ? "border-burgundy bg-burgundy text-cream"
                              : "border-burgundy/15 bg-background text-petrol hover:border-burgundy hover:bg-burgundy/5"
                          }`}
                        >
                          <span>{opt}</span>
                          {active && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {allowClear && value && (
              <div className="border-t border-burgundy/15 px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    onPick("");
                    setOpen(false);
                  }}
                  className="text-[0.65rem] uppercase tracking-[0.22em] text-petrol/70 hover:text-burgundy"
                >
                  remover seleção
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ===== Upload de inspirações ===== */
const InspiracoesUploader = ({
  urls,
  setUrls,
}: {
  urls: string[];
  setUrls: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 10 - urls.length;
    if (remaining <= 0) {
      toast.error("Máximo de 10 fotos de inspiração.");
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" não é uma imagem.`);
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`"${file.name}" passa de 8MB.`);
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("pedido-inspiracoes")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) {
          console.error(error);
          toast.error(`Falha ao enviar "${file.name}".`);
          continue;
        }
        const { data } = supabase.storage.from("pedido-inspiracoes").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length) {
        setUrls((prev) => [...prev, ...uploaded]);
        toast.success(`${uploaded.length} foto(s) enviada(s).`);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-petrol/70">
        Envie fotos de referência (Pinterest, prints, fotos suas) para a Sarah entender o estilo
        que você imagina. Até 10 imagens, 8MB cada.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || urls.length >= 10}
        className="rounded-xl border border-burgundy bg-burgundy/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-burgundy transition-all hover:bg-burgundy hover:text-cream disabled:opacity-50"
      >
        {uploading ? "Enviando..." : `+ adicionar fotos (${urls.length}/10)`}
      </button>

      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((u, i) => (
            <div
              key={u}
              className="group relative aspect-square overflow-hidden rounded-lg border border-burgundy/20"
            >
              <img src={u} alt={`Inspiração ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setUrls((prev) => prev.filter((x) => x !== u))}
                className="absolute right-1 top-1 rounded-full bg-petrol/80 px-2 py-0.5 text-[0.6rem] text-cream opacity-0 transition-opacity group-hover:opacity-100"
              >
                remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
