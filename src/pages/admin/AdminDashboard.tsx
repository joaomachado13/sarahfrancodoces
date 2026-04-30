import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard, BarChart3, Users, FileDown, Search, CalendarDays, Clock, Sparkles, TrendingUp, DollarSign, CheckCircle2, Timer, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-sarah-franco.png";
import type { OrderItem } from "@/types/order";
import { generatePedidoPdf } from "@/lib/generatePedidoPdf";
import { generatePerformanceReportPdf } from "@/lib/report/generatePerformanceReportPdf";
import type { PerformanceReportData } from "@/lib/report/types";
import { AnalyticsTab } from "@/components/admin/analytics/AnalyticsTab";
import { ClientesTab } from "@/components/admin/ClientesTab";

/* ─── helpers ─── */
const syncToSheets = (pedido: PedidoRow) => {
  supabase.functions
    .invoke("sync-pedido-sheets", {
      body: {
        id: pedido.id,
        nome_cliente: pedido.nome_cliente,
        telefone: pedido.telefone,
        tipo_logistica: pedido.tipo_logistica,
        data_evento: pedido.data_evento,
        itens: pedido.itens,
        status: pedido.status,
        observacoes_admin: pedido.observacoes_admin,
        created_at: pedido.created_at,
      },
    })
    .then(({ error }) => {
      if (error) console.error("Falha ao sincronizar com Sheets:", error);
    })
    .catch((e) => console.error("Falha ao sincronizar com Sheets:", e));
};

/* ─── types ─── */
export type PedidoRow = {
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

type PricedOrderItem = OrderItem & { valor?: number | null };

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "desconhecido";

const statusLabels = {
  novo: "Novo",
  em_orcamento: "Em orçamento",
  finalizado: "Finalizado",
} as const;

const fmtMoney = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

type Tab = "pedidos" | "analises" | "clientes";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "pedidos", label: "Pedidos", icon: LayoutDashboard },
  { id: "analises", label: "Análises", icon: BarChart3 },
  { id: "clientes", label: "Clientes", icon: Users },
];

/* ════════════════════════════════════════════════ */
const STATUS_COLUMNS: { status: PedidoRow["status"]; title: string; hint: string }[] = [
  { status: "novo", title: "Novo", hint: "Entradas recentes" },
  { status: "em_orcamento", title: "Em orçamento", hint: "Propostas em andamento" },
  { status: "finalizado", title: "Finalizado", hint: "Pedidos concluídos" },
];

const statusPill = {
  novo: "bg-burgundy text-cream",
  em_orcamento: "bg-petrol text-cream",
  finalizado: "border border-gold/50 bg-gold/20 text-petrol",
} as const;

const statusPanel = {
  novo: "border-burgundy/18 bg-burgundy/5",
  em_orcamento: "border-petrol/18 bg-petrol/5",
  finalizado: "border-gold/40 bg-gold/10",
} as const;

const fmtDate = (date: string) => new Date(`${date}T00:00`).toLocaleDateString("pt-BR");

const itemSummary = (item: OrderItem) => {
  if (item.tipo === "bolo") {
    return ["Bolo", item.tamanho, item.massa && `massa ${item.massa}`, item.recheio && `recheio ${item.recheio}`]
      .filter(Boolean)
      .join(" · ");
  }
  return [`${item.quantidade || 0} doces`, item.sabores].filter(Boolean).join(" · ");
};

const resumoPedido = (pedido: PedidoRow) => {
  const itens = pedido.itens || [];
  if (!itens.length) return "Pedido sem itens detalhados";
  const resumo = itens.slice(0, 2).map(itemSummary).join(" | ");
  return itens.length > 2 ? `${resumo} +${itens.length - 2} item(ns)` : resumo;
};

const isRecentNew = (pedido: PedidoRow) => {
  if (pedido.status !== "novo") return false;
  const created = new Date(pedido.created_at).getTime();
  return Date.now() - created < 1000 * 60 * 60 * 48;
};

const sameDate = (left: string, right: string) => left === right;

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [statusFilter, setStatusFilter] = useState<"todos" | PedidoRow["status"]>("todos");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"semana" | "mes" | "personalizado">("mes");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selected, setSelected] = useState<PedidoRow | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [reportData, setReportData] = useState<PerformanceReportData | null>(null);

  const sortPedidos = (rows: PedidoRow[]) =>
    [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar pedidos: " + error.message);
    else setPedidos(sortPedidos((data || []) as PedidoRow[]));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const next = payload.new as PedidoRow;
            setPedidos((prev) => sortPedidos(prev.some((p) => p.id === next.id) ? prev : [next, ...prev]));
          }
          if (payload.eventType === "UPDATE") {
            const next = payload.new as PedidoRow;
            setPedidos((prev) => sortPedidos(prev.map((p) => (p.id === next.id ? next : p))));
            setSelected((current) => (current?.id === next.id ? next : current));
          }
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            if (oldId) setPedidos((prev) => prev.filter((p) => p.id !== oldId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentMonthPedidos = useMemo(() => {
    const now = new Date();
    return pedidos.filter((p) => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [pedidos]);

  const previousMonthPedidos = useMemo(() => {
    const now = new Date();
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return pedidos.filter((p) => {
      const d = new Date(p.created_at);
      return d.getMonth() === previous.getMonth() && d.getFullYear() === previous.getFullYear();
    });
  }, [pedidos]);

  const analyticsPedidos = useMemo(() => {
    const now = new Date();
    if (periodFilter === "semana") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return pedidos.filter((p) => new Date(p.created_at) >= start);
    }
    if (periodFilter === "personalizado") {
      return pedidos.filter((p) => {
        const created = new Date(p.created_at);
        const afterStart = customStart ? created >= new Date(`${customStart}T00:00`) : true;
        const beforeEnd = customEnd ? created <= new Date(`${customEnd}T23:59:59`) : true;
        return afterStart && beforeEnd;
      });
    }
    return currentMonthPedidos;
  }, [currentMonthPedidos, customEnd, customStart, pedidos, periodFilter]);

  const kpis = useMemo(() => {
    const pedidosComValor = pedidos.filter((p) => p.valor_total != null);
    const faturamento = pedidosComValor.reduce((sum, p) => sum + Number(p.valor_total || 0), 0);
    const ticketMedio = pedidosComValor.length ? faturamento / pedidosComValor.length : 0;
    const crescimento = previousMonthPedidos.length
      ? ((currentMonthPedidos.length - previousMonthPedidos.length) / previousMonthPedidos.length) * 100
      : currentMonthPedidos.length
        ? 100
        : 0;

    return [
      { label: "Total de pedidos", value: pedidos.length, sub: "base completa", icon: LayoutDashboard },
      { label: "Pedidos do mês", value: currentMonthPedidos.length, sub: `${crescimento >= 0 ? "+" : ""}${crescimento.toFixed(1)}% vs mês anterior`, icon: TrendingUp },
      { label: "Finalizados", value: pedidos.filter((p) => p.status === "finalizado").length, sub: "pedidos concluídos", icon: CheckCircle2 },
      { label: "Em orçamento", value: pedidos.filter((p) => p.status === "em_orcamento").length, sub: "em negociação", icon: Timer },
      { label: "Ticket médio", value: fmtMoney(ticketMedio), sub: "pedidos com valor", icon: DollarSign },
      { label: "Faturamento", value: fmtMoney(faturamento), sub: "estimado lançado", icon: BarChart3 },
    ];
  }, [currentMonthPedidos.length, pedidos, previousMonthPedidos.length]);

  const filteredPedidos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pedidos.filter((pedido) => {
      const matchesSearch = !q || [pedido.nome_cliente, pedido.telefone, resumoPedido(pedido)]
        .join(" ")
        .toLowerCase()
        .includes(q);
      const matchesDate = !dateFilter || sameDate(pedido.data_evento, dateFilter);
      return matchesSearch && matchesDate;
    });
  }, [dateFilter, pedidos, search]);

  const visibleColumns = statusFilter === "todos"
    ? STATUS_COLUMNS
    : STATUS_COLUMNS.filter((column) => column.status === statusFilter);

  const faturamento = useMemo(
    () => pedidos.reduce((s, p) => s + Number(p.valor_total || 0), 0),
    [pedidos],
  );

  const carregarInsights = useCallback(async (showToast = false) => {
    try {
      setInsightLoading(true);
      const { data, error } = await supabase.functions.invoke("generate-performance-report", {
        body: { monthsBack: 6 },
      });
      if (error) throw error;
      setReportData(data as PerformanceReportData);
      if (showToast) toast.success("Insights atualizados");
      return data as PerformanceReportData;
    } catch (error: unknown) {
      console.error("Erro ao gerar insights:", error);
      if (showToast) toast.error("Não foi possível atualizar os insights agora.");
      return null;
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "analises" && !reportData && !insightLoading) {
      carregarInsights(false);
    }
  }, [activeTab, carregarInsights, insightLoading, reportData]);

  const gerarRelatorio = async () => {
    try {
      setReportLoading(true);
      const { data, error } = await supabase.functions.invoke("generate-performance-report", {
        body: { monthsBack: 6 },
      });
      if (error) throw error;
      setReportData(data as PerformanceReportData);
      generatePerformanceReportPdf(data as PerformanceReportData, pedidos.slice(0, 8));
      toast.success("Relatório gerado com sucesso");
    } catch (error: unknown) {
      toast.error("Erro ao gerar relatório: " + getErrorMessage(error));
    } finally {
      setReportLoading(false);
    }
  };

  const updateStatus = async (id: string, status: PedidoRow["status"]) => {
    const current = pedidos.find((p) => p.id === id);
    if (!current || current.status === status) return;

    setUpdatingId(id);
    const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success("Status atualizado");
    syncToSheets({ ...current, status });
    setPedidos((prev) => sortPedidos(prev.map((p) => (p.id === id ? { ...p, status } : p))));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const updateValor = async (
    id: string,
    valor_total: number | null,
    observacoes_admin: string | null,
    itens: OrderItem[],
  ) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ valor_total, observacoes_admin, itens: itens as never, status: "em_orcamento" })
      .eq("id", id);
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Orçamento salvo");
    const base = pedidos.find((p) => p.id === id);
    if (base) syncToSheets({ ...base, valor_total, observacoes_admin, itens, status: "em_orcamento" });
    setPedidos((prev) =>
      sortPedidos(prev.map((p) =>
        p.id === id ? { ...p, valor_total, observacoes_admin, itens, status: "em_orcamento" } : p,
      )),
    );
    if (selected?.id === id)
      setSelected({ ...selected, valor_total, observacoes_admin, itens, status: "em_orcamento" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-burgundy/12 bg-cream/95 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img
              src={logo}
              alt="Sarah Franco"
              className="h-8 w-auto"
              style={{ filter: "brightness(0.4) sepia(1) hue-rotate(-20deg) saturate(6)" }}
            />
            <span className="hidden text-[0.65rem] uppercase tracking-[0.3em] text-petrol/50 md:inline">
              · Painel
            </span>
          </Link>

          <nav className="flex items-center gap-1 rounded-xl border border-burgundy/12 bg-background p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-all duration-200 sm:px-4 ${
                  activeTab === id
                    ? "bg-burgundy text-cream shadow-sm"
                    : "text-petrol/60 hover:text-petrol"
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden max-w-[180px] truncate text-[0.65rem] uppercase tracking-[0.2em] text-petrol/40 lg:inline">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="text-[0.65rem] uppercase tracking-[0.25em] text-petrol/60 transition-colors hover:text-burgundy"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container-narrow py-8 md:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Administração</span>
            <h1 className="mt-3 font-serif text-3xl text-petrol md:text-4xl">
              {activeTab === "pedidos" && (
                <>CRM de <span className="font-script text-burgundy">pedidos</span></>
              )}
              {activeTab === "analises" && (
                <>Análises <span className="font-script text-burgundy">& Insights</span></>
              )}
              {activeTab === "clientes" && (
                <>Gestão de <span className="font-script text-burgundy">clientes</span></>
              )}
            </h1>
            <p className="mt-1.5 text-sm text-petrol/50">
              {pedidos.length} pedido{pedidos.length !== 1 && "s"} · {fmtMoney(faturamento)} faturados
            </p>
          </div>

          <button
            onClick={gerarRelatorio}
            disabled={reportLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-burgundy bg-burgundy px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] text-cream transition-all hover:bg-burgundy-deep disabled:opacity-60 sm:w-auto"
          >
            <FileDown size={13} />
            {reportLoading ? "Gerando…" : "Gerar relatório"}
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl border border-burgundy/10 bg-cream" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {kpis.map(({ label, value, sub, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-burgundy/12 bg-cream p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.6rem] uppercase tracking-[0.22em] text-petrol/50">{label}</p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy/8 text-burgundy">
                      <Icon size={14} />
                    </span>
                  </div>
                  <p className="mt-3 font-serif text-2xl text-petrol">{value}</p>
                  <p className="mt-1 text-[0.65rem] text-petrol/45">{sub}</p>
                </div>
              ))}
            </div>

            {activeTab === "pedidos" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-burgundy/12 bg-cream p-4 shadow-soft">
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                    <label className="flex items-center gap-2.5 rounded-xl border border-burgundy/15 bg-background px-3.5 py-2.5">
                      <Search size={14} className="text-petrol/40" />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por cliente, telefone ou pedido…"
                        className="w-full bg-transparent text-sm text-petrol placeholder:text-petrol/35 focus:outline-none"
                      />
                    </label>

                    <label className="flex items-center gap-2.5 rounded-xl border border-burgundy/15 bg-background px-3.5 py-2.5">
                      <CalendarDays size={14} className="text-petrol/40" />
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(event) => setDateFilter(event.target.value)}
                        className="bg-transparent text-sm text-petrol focus:outline-none"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {(["todos", "novo", "em_orcamento", "finalizado"] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`rounded-xl border px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] transition-all ${
                            statusFilter === status
                              ? "border-burgundy bg-burgundy text-cream"
                              : "border-burgundy/20 text-petrol/60 hover:border-burgundy/50"
                          }`}
                        >
                          {status === "todos" ? "Todos" : statusLabels[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  {visibleColumns.map((column) => {
                    const columnPedidos = filteredPedidos.filter((pedido) => pedido.status === column.status);
                    return (
                      <section
                        key={column.status}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggedId) updateStatus(draggedId, column.status);
                          setDraggedId(null);
                        }}
                        className={`min-h-[320px] rounded-2xl border p-4 shadow-soft ${statusPanel[column.status]}`}
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${column.status === "novo" ? "bg-burgundy" : column.status === "em_orcamento" ? "bg-petrol" : "bg-gold"}`} />
                              <h2 className="font-serif text-xl text-petrol">{column.title}</h2>
                            </div>
                            <p className="mt-1 text-xs text-petrol/45">{column.hint}</p>
                          </div>
                          <span className="rounded-full border border-burgundy/15 bg-cream px-2.5 py-1 text-xs font-semibold text-burgundy">
                            {columnPedidos.length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {columnPedidos.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-burgundy/18 bg-cream/60 px-4 py-10 text-center">
                              <p className="text-sm text-petrol/40">Nenhum pedido nesta etapa.</p>
                            </div>
                          ) : (
                            columnPedidos.map((pedido) => (
                              <article
                                key={pedido.id}
                                draggable
                                onDragStart={() => setDraggedId(pedido.id)}
                                onDragEnd={() => setDraggedId(null)}
                                onClick={() => setSelected(pedido)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") setSelected(pedido);
                                }}
                                role="button"
                                tabIndex={0}
                                className={`group cursor-grab rounded-2xl border bg-cream p-4 text-left transition-all hover:border-burgundy/40 hover:shadow-soft active:cursor-grabbing ${
                                  isRecentNew(pedido) ? "border-burgundy/45 ring-2 ring-burgundy/8" : "border-burgundy/12"
                                } ${updatingId === pedido.id ? "opacity-60" : ""}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 font-serif text-lg font-bold text-burgundy">
                                      {pedido.nome_cliente.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate font-medium text-petrol">{pedido.nome_cliente}</p>
                                        {isRecentNew(pedido) && (
                                          <span className="rounded-full bg-burgundy/10 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em] text-burgundy">
                                            Novo
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-1 text-xs text-petrol/50">{pedido.telefone}</p>
                                    </div>
                                  </div>
                                  <GripVertical size={15} className="mt-1 shrink-0 text-petrol/25 transition-colors group-hover:text-burgundy/60" />
                                </div>

                                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-petrol/70">{resumoPedido(pedido)}</p>

                                <div className="mt-4 grid gap-2 text-xs text-petrol/55">
                                  <span className="flex items-center gap-2">
                                    <CalendarDays size={13} className="text-burgundy/50" />
                                    Evento em {fmtDate(pedido.data_evento)}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <Clock size={13} className="text-burgundy/50" />
                                    Criado em {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                                  </span>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-burgundy/8 pt-3">
                                  <span className={`rounded-full px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] ${statusPill[pedido.status]}`}>
                                    {statusLabels[pedido.status]}
                                  </span>
                                  <strong className="text-sm text-burgundy">
                                    {pedido.valor_total != null ? fmtMoney(Number(pedido.valor_total)) : "Sem valor"}
                                  </strong>
                                </div>
                              </article>
                            ))
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "analises" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-burgundy/12 bg-cream p-4 shadow-soft">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-burgundy/70">Período de análise</p>
                      <p className="mt-1 text-sm text-petrol/50">Os gráficos abaixo usam {analyticsPedidos.length} pedido{analyticsPedidos.length !== 1 ? "s" : ""} no recorte selecionado.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(["semana", "mes", "personalizado"] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setPeriodFilter(period)}
                          className={`rounded-xl border px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] transition-all ${
                            periodFilter === period
                              ? "border-burgundy bg-burgundy text-cream"
                              : "border-burgundy/20 text-petrol/60 hover:border-burgundy/50"
                          }`}
                        >
                          {period === "semana" ? "Semana" : period === "mes" ? "Mês" : "Personalizado"}
                        </button>
                      ))}
                      {periodFilter === "personalizado" && (
                        <>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(event) => setCustomStart(event.target.value)}
                            className="rounded-xl border border-burgundy/15 bg-background px-3 py-2 text-sm text-petrol focus:outline-none"
                          />
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(event) => setCustomEnd(event.target.value)}
                            className="rounded-xl border border-burgundy/15 bg-background px-3 py-2 text-sm text-petrol focus:outline-none"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <section className="rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-burgundy" />
                        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-burgundy/70">Insights inteligentes</p>
                      </div>
                      <h2 className="mt-2 font-serif text-2xl text-petrol">Leitura automática do negócio</h2>
                    </div>
                    <button
                      onClick={() => carregarInsights(true)}
                      disabled={insightLoading}
                      className="rounded-xl border border-burgundy/30 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-burgundy transition-colors hover:bg-burgundy hover:text-cream disabled:opacity-50"
                    >
                      {insightLoading ? "Analisando…" : "Atualizar IA"}
                    </button>
                  </div>

                  {reportData?.insights ? (
                    <div className="grid gap-5 lg:grid-cols-3">
                      <div className="lg:col-span-3 rounded-xl bg-background p-4 text-sm leading-relaxed text-petrol/70">
                        {reportData.insights.summary}
                      </div>
                      <InsightList title="Pontos fortes" items={reportData.insights.strengths} />
                      <InsightList title="Oportunidades" items={reportData.insights.improvements} />
                      <InsightList title="Ações sugeridas" items={reportData.insights.actions} />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-burgundy/18 bg-background p-6 text-sm text-petrol/45">
                      {insightLoading ? "Gerando análise com IA…" : "Abra esta aba para gerar uma leitura inteligente dos dados."}
                    </div>
                  )}
                </section>

                <AnalyticsTab pedidos={analyticsPedidos} />
              </div>
            )}

            {activeTab === "clientes" && <ClientesTab pedidos={pedidos} />}
          </>
        )}
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

const InsightList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="rounded-xl bg-background p-4">
    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-burgundy/70">{title}</p>
    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-petrol/70">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ════════════════════════════════════════════════ */
/* Drawer lateral de pedido — preservado intacto  */
/* ════════════════════════════════════════════════ */
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

  const subtotal = Object.values(valoresItens).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const aplicarSubtotal = () => setValor(subtotal ? subtotal.toFixed(2) : "");
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
              className="rounded-xl border border-burgundy bg-burgundy px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-cream transition-colors hover:bg-burgundy-deep disabled:opacity-50"
            >
              {exporting ? "Gerando…" : "Baixar PDF"}
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
            <p>{new Date(pedido.data_evento + "T00:00").toLocaleDateString("pt-BR")} às {pedido.horario_evento}</p>
          </Block>

          <Block title={pedido.tipo_logistica === "entrega" ? "Entrega" : "Retirada"}>
            {pedido.tipo_logistica === "entrega" ? (
              <>
                <p>{pedido.endereco_entrega}</p>
                <p>
                  {pedido.data_entrega && new Date(pedido.data_entrega + "T00:00").toLocaleDateString("pt-BR")} às {pedido.horario_entrega}
                </p>
              </>
            ) : (
              <p>
                {pedido.data_retirada && new Date(pedido.data_retirada + "T00:00").toLocaleDateString("pt-BR")} às {pedido.horario_retirada}
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
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-petrol/50">Valor</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-petrol/60">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valoresItens[it.id] || ""}
                        onChange={(e) => setValoresItens((prev) => ({ ...prev, [it.id]: e.target.value }))}
                        placeholder="0,00"
                        className="w-28 rounded-lg border border-burgundy/20 bg-background px-2 py-1.5 text-sm text-petrol focus:border-burgundy focus:outline-none"
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
                  className={`rounded-xl border px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition-all ${
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
                    className="w-full rounded-lg border border-burgundy/20 bg-background px-4 py-3 text-sm text-petrol focus:border-burgundy focus:outline-none"
                    placeholder="0,00"
                  />
                </label>
                <button
                  type="button"
                  onClick={aplicarSubtotal}
                  className="rounded-xl border border-burgundy/30 px-3 py-3 text-[0.6rem] uppercase tracking-[0.2em] text-burgundy hover:bg-burgundy hover:text-cream"
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
                  className="w-full resize-none rounded-lg border border-burgundy/20 bg-background px-4 py-3 text-sm text-petrol focus:border-burgundy focus:outline-none"
                  placeholder="Detalhes do orçamento, prazo, etc."
                />
              </label>
              <button
                onClick={salvar}
                className="rounded-xl bg-burgundy px-6 py-3 text-xs uppercase tracking-[0.25em] text-cream transition-colors hover:bg-burgundy-deep"
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
