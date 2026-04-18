import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-sarah-franco.png";
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
});

const stepLabels = ["Você", "Evento", "Entrega", "Pedido", "Revisão"];

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
  const [itens, setItens] = useState<OrderItem[]>([newBolo()]);

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
    };

    const parsed = pedidoSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Verifique os dados do pedido antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase.from("pedidos").insert(parsed.data as any);
      if (error) throw error;
      toast.success("Pedido enviado! Entraremos em contato em breve.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      toast.error("Erro ao enviar pedido: " + (err.message || "tente novamente"));
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-burgundy/15 bg-cream">
        <div className="container-narrow flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Sarah Franco"
              className="h-9 w-auto"
              style={{ filter: "brightness(0.4) sepia(1) hue-rotate(-20deg) saturate(6)" }}
            />
          </Link>
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.25em] text-petrol/70 hover:text-burgundy"
          >
            ← voltar
          </Link>
        </div>
      </header>

      <div className="container-narrow py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          {/* Title */}
          <div className="text-center">
            <span className="eyebrow">Solicitar orçamento</span>
            <h1 className="mt-6 font-serif text-4xl leading-tight text-petrol md:text-5xl">
              Vamos montar seu <span className="font-script text-burgundy">pedido</span>
            </h1>
          </div>

          {/* Stepper */}
          <ol className="mt-12 grid grid-cols-5 gap-2 md:gap-4">
            {stepLabels.map((label, i) => (
              <li key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs transition-all ${
                    i <= step
                      ? "border-burgundy bg-burgundy text-cream"
                      : "border-burgundy/30 bg-transparent text-petrol/50"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-[0.6rem] uppercase tracking-[0.2em] md:text-[0.65rem] ${
                    i <= step ? "text-burgundy" : "text-petrol/50"
                  }`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>

          {/* Card */}
          <div className="mt-12 border border-burgundy/15 bg-cream p-6 shadow-soft md:p-12">
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
              />
            )}

            {/* Nav buttons */}
            <div className="mt-10 flex items-center justify-between border-t border-burgundy/15 pt-8">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="text-xs uppercase tracking-[0.25em] text-petrol/70 transition-colors hover:text-burgundy disabled:opacity-30"
              >
                ← Voltar
              </button>
              {step < stepLabels.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="group inline-flex items-center gap-3 bg-burgundy px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-cream transition-all duration-500 hover:bg-burgundy-deep"
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
                  className="group inline-flex items-center gap-3 bg-burgundy px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-cream transition-all duration-500 hover:bg-burgundy-deep disabled:opacity-50"
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
    <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.25em] text-petrol/70">
      {label}
    </span>
    {children}
  </label>
);

const inputCls =
  "w-full border border-burgundy/20 bg-background px-4 py-3 text-sm text-petrol placeholder:text-petrol/40 transition-colors focus:border-burgundy focus:outline-none";

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
          className={`border px-6 py-5 text-sm uppercase tracking-[0.2em] transition-all ${
            logistica.modo === mode
              ? "border-burgundy bg-burgundy text-cream"
              : "border-burgundy/25 bg-background text-petrol/70 hover:border-burgundy"
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
          className="border border-burgundy/15 bg-background p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-burgundy">
              Item {idx + 1} — {item.tipo === "doce" ? "Doces" : "Bolo"}
            </p>
            {itens.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs uppercase tracking-[0.2em] text-petrol/50 hover:text-burgundy"
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

    <div className="grid grid-cols-2 gap-3 border-t border-burgundy/15 pt-6">
      <button
        type="button"
        onClick={() => setItens([...itens, newDoce()])}
        className="border border-burgundy/30 px-6 py-4 text-xs uppercase tracking-[0.25em] text-burgundy transition-colors hover:bg-burgundy hover:text-cream"
      >
        + adicionar doce
      </button>
      <button
        type="button"
        onClick={() => setItens([...itens, newBolo()])}
        className="border border-burgundy/30 px-6 py-4 text-xs uppercase tracking-[0.25em] text-burgundy transition-colors hover:bg-burgundy hover:text-cream"
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
}) => (
  <div className="space-y-5">
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Quantidade">
        <input
          type="number"
          min={1}
          className={inputCls}
          value={item.quantidade}
          onChange={(e) =>
            updateItem(item.id, { quantidade: Number(e.target.value) })
          }
        />
      </Field>
      <Field label="Cor da forminha">
        <input
          className={inputCls}
          value={item.corForminha}
          onChange={(e) => updateItem(item.id, { corForminha: e.target.value })}
          placeholder="Ex: dourada, rosé, branca..."
        />
      </Field>
    </div>
    <Field label="Sabores (texto livre)">
      <textarea
        rows={3}
        className={inputCls + " resize-none"}
        value={item.sabores}
        onChange={(e) => updateItem(item.id, { sabores: e.target.value })}
        placeholder="Ex: brigadeiro tradicional, pistache, beijinho de coco..."
      />
    </Field>
    <Field label="Observações">
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

const BoloFields = ({
  item,
  updateItem,
}: {
  item: BoloItem;
  updateItem: (id: string, patch: Partial<OrderItem>) => void;
}) => (
  <div className="space-y-5">
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Tamanho">
        <input
          className={inputCls}
          value={item.tamanho}
          onChange={(e) => updateItem(item.id, { tamanho: e.target.value })}
          placeholder="Ex: 2 andares, 30 fatias..."
        />
      </Field>
      <Field label="Massa">
        <input
          className={inputCls}
          value={item.massa}
          onChange={(e) => updateItem(item.id, { massa: e.target.value })}
          placeholder="Ex: baunilha, chocolate, red velvet..."
        />
      </Field>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Recheio">
        <input
          className={inputCls}
          value={item.recheio}
          onChange={(e) => updateItem(item.id, { recheio: e.target.value })}
          placeholder="Ex: brigadeiro com morango..."
        />
      </Field>
      <Field label="Cobertura">
        <input
          className={inputCls}
          value={item.cobertura}
          onChange={(e) => updateItem(item.id, { cobertura: e.target.value })}
          placeholder="Ex: chantilly, fondant bordô..."
        />
      </Field>
    </div>
    <Field label="Observações">
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

const StepReview = ({
  cliente,
  evento,
  logistica,
  itens,
}: {
  cliente: CustomerData;
  evento: EventData;
  logistica: LogisticsData;
  itens: OrderItem[];
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
                {it.quantidade} unid. · {it.sabores || "(sabores a definir)"}
              </p>
            ) : (
              <p className="mt-1 text-sm text-petrol/80">
                {it.tamanho} · {it.massa} / {it.recheio} / {it.cobertura}
              </p>
            )}
          </li>
        ))}
      </ul>
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
    <h2 className="font-serif text-3xl text-petrol">{title}</h2>
    <p className="mt-2 text-sm text-petrol/60">{subtitle}</p>
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
