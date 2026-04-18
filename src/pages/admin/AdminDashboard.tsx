import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-sarah-franco.png";
import type { OrderItem } from "@/types/order";
import { generatePedidoPdf } from "@/lib/generatePedidoPdf";

type PedidoRow = {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  data_evento: string;
  horario_evento: string;
  tipo_logistica: "retirada" | "entrega";
  endereco_entrega: string | null;
  data_entrega: string | null;
  horario_entrega: string | null;
  data_retirada: string | null;
  horario_retirada: string | null;
  itens: OrderItem[];
  status: "novo" | "em_orcamento" | "finalizado";
  valor_total: number | null;
  observacoes_admin: string | null;
  created_at: string;
};

const statusLabels = {
  novo: "Novo",
  em_orcamento: "Em orçamento",
  finalizado: "Finalizado",
} as const;

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | PedidoRow["status"]>("todos");
  const [selected, setSelected] = useState<PedidoRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar pedidos: " + error.message);
    } else {
      setPedidos((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "todos" ? pedidos : pedidos.filter((p) => p.status === filter);

  const updateStatus = async (id: string, status: PedidoRow["status"]) => {
    const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success("Status atualizado");
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const updateValor = async (
    id: string,
    valor_total: number | null,
    observacoes_admin: string | null,
    itens: OrderItem[]
  ) => {
    const { error } = await supabase
      .from("pedidos")
      .update({
        valor_total,
        observacoes_admin,
        itens: itens as any,
        status: "em_orcamento",
      })
      .eq("id", id);
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success("Orçamento salvo");
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, valor_total, observacoes_admin, itens, status: "em_orcamento" }
          : p
      )
    );
    if (selected?.id === id)
      setSelected({ ...selected, valor_total, observacoes_admin, itens, status: "em_orcamento" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-burgundy/15 bg-cream">
        <div className="container-narrow flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Sarah Franco"
              className="h-9 w-auto"
              style={{ filter: "brightness(0.4) sepia(1) hue-rotate(-20deg) saturate(6)" }}
            />
            <span className="hidden text-xs uppercase tracking-[0.3em] text-petrol/60 md:inline">
              · Painel
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden text-[0.7rem] uppercase tracking-[0.2em] text-petrol/50 md:inline">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="text-xs uppercase tracking-[0.25em] text-petrol/70 hover:text-burgundy"
            >
              sair
            </button>
          </div>
        </div>
      </header>

      <div className="container-narrow py-12 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Administração</span>
            <h1 className="mt-4 font-serif text-4xl text-petrol md:text-5xl">
              Pedidos <span className="font-script text-burgundy">recebidos</span>
            </h1>
            <p className="mt-2 text-sm text-petrol/60">
              {pedidos.length} pedido{pedidos.length !== 1 && "s"} no total
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["todos", "novo", "em_orcamento", "finalizado"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`border px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] transition-all ${
                  filter === s
                    ? "border-burgundy bg-burgundy text-cream"
                    : "border-burgundy/25 text-petrol/70 hover:border-burgundy"
                }`}
              >
                {s === "todos" ? "Todos" : statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {loading ? (
            <p className="text-center text-xs uppercase tracking-[0.3em] text-petrol/40">carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="border border-dashed border-burgundy/20 p-12 text-center text-sm text-petrol/50">
              Nenhum pedido {filter !== "todos" && `com status "${statusLabels[filter as keyof typeof statusLabels]}"`}.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="block w-full border border-burgundy/15 bg-cream p-5 text-left transition-all hover:border-burgundy hover:shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-xl text-petrol">{p.nome_cliente}</p>
                      <p className="mt-1 text-xs text-petrol/60">
                        {new Date(p.created_at).toLocaleString("pt-BR")} · {p.itens.length} item(ns) ·{" "}
                        {p.tipo_logistica}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.valor_total != null && (
                        <span className="text-sm font-medium text-burgundy">
                          R$ {Number(p.valor_total).toFixed(2)}
                        </span>
                      )}
                      <span
                        className={`border px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] ${
                          p.status === "novo"
                            ? "border-burgundy bg-burgundy text-cream"
                            : p.status === "em_orcamento"
                            ? "border-petrol/40 text-petrol"
                            : "border-petrol/20 text-petrol/50"
                        }`}
                      >
                        {statusLabels[p.status]}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <PedidoDetail
          pedido={selected}
          onClose={() => setSelected(null)}
          onStatus={(s) => updateStatus(selected.id, s)}
          onSaveOrcamento={(v, obs, itens) => updateValor(selected.id, v, obs, itens)}
        />
      )}
    </div>
  );
};

const PedidoDetail = ({
  pedido,
  onClose,
  onStatus,
  onSaveOrcamento,
}: {
  pedido: PedidoRow;
  onClose: () => void;
  onStatus: (s: PedidoRow["status"]) => void;
  onSaveOrcamento: (valor: number | null, obs: string | null, itens: OrderItem[]) => void;
}) => {
  const [valoresItens, setValoresItens] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      pedido.itens.map((it) => [it.id, (it as any).valor != null ? String((it as any).valor) : ""])
    )
  );
  const [valor, setValor] = useState(pedido.valor_total?.toString() || "");
  const [obs, setObs] = useState(pedido.observacoes_admin || "");
  const [exporting, setExporting] = useState(false);

  const subtotal = Object.values(valoresItens).reduce(
    (acc, v) => acc + (Number(v) || 0),
    0
  );

  const aplicarSubtotal = () => {
    setValor(subtotal ? subtotal.toFixed(2) : "");
  };

  const salvar = () => {
    const itensComValor = pedido.itens.map((it) => ({
      ...it,
      valor: valoresItens[it.id] ? Number(valoresItens[it.id]) : null,
    })) as OrderItem[];
    onSaveOrcamento(valor ? Number(valor) : null, obs || null, itensComValor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-petrol/40 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-y-auto bg-cream shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-burgundy/15 bg-cream px-8 py-5">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-burgundy">Detalhe do pedido</p>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  setExporting(true);
                  generatePedidoPdf(pedido);
                  toast.success("PDF gerado");
                } catch (e: any) {
                  toast.error("Erro ao gerar PDF: " + (e?.message || "desconhecido"));
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="border border-burgundy bg-burgundy px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-cream transition-colors hover:bg-burgundy-deep disabled:opacity-50"
            >
              {exporting ? "Gerando..." : "Baixar PDF"}
            </button>
            <button onClick={onClose} className="text-xs uppercase tracking-[0.2em] text-petrol/60 hover:text-burgundy">
              fechar ✕
            </button>
          </div>
        </div>

        <div className="space-y-8 px-8 py-10">
          <section>
            <h2 className="font-serif text-3xl text-petrol">{pedido.nome_cliente}</h2>
            <p className="mt-1 text-xs text-petrol/50">
              criado em {new Date(pedido.created_at).toLocaleString("pt-BR")}
            </p>
          </section>

          <Block title="Cliente">
            <p>{pedido.telefone}</p>
            <p>{pedido.endereco}</p>
          </Block>

          <Block title="Evento">
            <p>
              {new Date(pedido.data_evento + "T00:00").toLocaleDateString("pt-BR")} às {pedido.horario_evento}
            </p>
          </Block>

          <Block title={pedido.tipo_logistica === "entrega" ? "Entrega" : "Retirada"}>
            {pedido.tipo_logistica === "entrega" ? (
              <>
                <p>{pedido.endereco_entrega}</p>
                <p>
                  {pedido.data_entrega && new Date(pedido.data_entrega + "T00:00").toLocaleDateString("pt-BR")} às{" "}
                  {pedido.horario_entrega}
                </p>
              </>
            ) : (
              <p>
                {pedido.data_retirada && new Date(pedido.data_retirada + "T00:00").toLocaleDateString("pt-BR")} às{" "}
                {pedido.horario_retirada}
              </p>
            )}
          </Block>

          <Block title={`Itens (${pedido.itens.length})`}>
            <ul className="space-y-5">
              {pedido.itens.map((it, i) => (
                <li key={it.id} className="border-l-2 border-burgundy pl-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.25em] text-burgundy">
                    {i + 1} — {it.tipo}
                  </p>
                  {it.tipo === "doce" ? (
                    <div className="mt-1 space-y-1 text-sm text-petrol/80">
                      <p>{it.quantidade} unidades · forminha: {it.corForminha || "—"}</p>
                      <p>Sabores: {it.sabores || "—"}</p>
                      {it.observacoes && <p className="text-petrol/60">Obs: {it.observacoes}</p>}
                    </div>
                  ) : (
                    <div className="mt-1 space-y-1 text-sm text-petrol/80">
                      <p>Tamanho: {it.tamanho || "—"}</p>
                      <p>Massa: {it.massa || "—"} · Recheio: {it.recheio || "—"} · Cobertura: {it.cobertura || "—"}</p>
                      {it.observacoes && <p className="text-petrol/60">Obs: {it.observacoes}</p>}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-petrol/50">
                      Valor
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-petrol/60">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valoresItens[it.id] || ""}
                        onChange={(e) =>
                          setValoresItens((prev) => ({ ...prev, [it.id]: e.target.value }))
                        }
                        placeholder="0,00"
                        className="w-28 border border-burgundy/20 bg-background px-2 py-1.5 text-sm text-petrol focus:border-burgundy focus:outline-none"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Status">
            <div className="flex flex-wrap gap-2">
              {(["novo", "em_orcamento", "finalizado"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  className={`border px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition-all ${
                    pedido.status === s
                      ? "border-burgundy bg-burgundy text-cream"
                      : "border-burgundy/25 text-petrol/70 hover:border-burgundy"
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </Block>

          <Block title="Orçamento">
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <label className="block flex-1">
                  <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-petrol/60">
                    Valor total (R$)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full border border-burgundy/20 bg-background px-4 py-3 text-sm text-petrol focus:border-burgundy focus:outline-none"
                    placeholder="0,00"
                  />
                </label>
                <button
                  type="button"
                  onClick={aplicarSubtotal}
                  className="border border-burgundy/30 px-3 py-3 text-[0.6rem] uppercase tracking-[0.2em] text-burgundy hover:bg-burgundy hover:text-cream"
                  title="Somar valores dos itens"
                >
                  Σ R$ {subtotal.toFixed(2)}
                </button>
              </div>
              <label className="block">
                <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-petrol/60">
                  Observações internas
                </span>
                <textarea
                  rows={3}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  className="w-full resize-none border border-burgundy/20 bg-background px-4 py-3 text-sm text-petrol focus:border-burgundy focus:outline-none"
                  placeholder="Detalhes do orçamento, prazo, etc."
                />
              </label>
              <button
                onClick={salvar}
                className="bg-burgundy px-6 py-3 text-xs uppercase tracking-[0.25em] text-cream transition-colors hover:bg-burgundy-deep"
              >
                Salvar orçamento
              </button>
              <p className="text-[0.65rem] text-petrol/50">
                Ao salvar, o status é atualizado automaticamente para "Em orçamento".
              </p>
            </div>
          </Block>
        </div>
      </div>
    </div>
  );
};

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-t border-burgundy/15 pt-5">
    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-burgundy/80">{title}</p>
    <div className="mt-3 space-y-1 text-sm text-petrol/80">{children}</div>
  </div>
);

export default AdminDashboard;
