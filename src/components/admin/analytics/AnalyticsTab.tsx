import { useMemo } from "react";
import { TrendingUp, ShoppingBag, DollarSign, CheckCircle2, Clock, BarChart3 } from "lucide-react";
import { KpiCard } from "./KpiCard";
import {
  FaturamentoChart,
  PedidosTrendChart,
  TipoDistChart,
  StatusFunilChart,
} from "./Charts";
import type { OrderItem } from "@/types/order";

type PedidoRow = {
  id: string;
  nome_cliente: string;
  telefone: string;
  data_evento: string;
  tipo_logistica: "retirada" | "entrega";
  itens: OrderItem[];
  status: "novo" | "em_orcamento" | "finalizado";
  valor_total: number | null;
  created_at: string;
};

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const ADMIN_START_DATE = new Date("2026-05-01T00:00:00");

function calcTrend(current: number, previous: number): number | undefined {
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

export function AnalyticsTab({ pedidos }: { pedidos: PedidoRow[] }) {
  /* ── KPIs ── */
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
  const prevYear = curMonth === 0 ? curYear - 1 : curYear;

  const thisMonthPedidos = pedidos.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === curMonth && d.getFullYear() === curYear;
  });
  const prevMonthPedidos = pedidos.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const faturamentoTotal = useMemo(
    () => pedidos.reduce((s, p) => s + Number(p.valor_total || 0), 0),
    [pedidos]
  );
  const faturamentoMes = useMemo(
    () => thisMonthPedidos.reduce((s, p) => s + Number(p.valor_total || 0), 0),
    [thisMonthPedidos]
  );
  const faturamentoPrevMes = useMemo(
    () => prevMonthPedidos.reduce((s, p) => s + Number(p.valor_total || 0), 0),
    [prevMonthPedidos]
  );

  const ticketMedio = useMemo(() => {
    const comValor = pedidos.filter((p) => p.valor_total != null);
    return comValor.length > 0
      ? comValor.reduce((s, p) => s + Number(p.valor_total), 0) / comValor.length
      : 0;
  }, [pedidos]);

  const taxaConversao = useMemo(() => {
    if (pedidos.length === 0) return 0;
    return (pedidos.filter((p) => p.status === "finalizado").length / pedidos.length) * 100;
  }, [pedidos]);

  const fmtMoney = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  /* ── Dados por mês (últimos 6 meses) ── */
  const monthlyData = useMemo(() => {
    const months: { mes: string; faturamento: number; pedidos: number }[] = [];
    const monthsSinceStart = (curYear - ADMIN_START_DATE.getFullYear()) * 12 + curMonth - ADMIN_START_DATE.getMonth() + 1;
    const monthCount = Math.max(1, Math.min(6, monthsSinceStart));
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthPedidos = pedidos.filter((p) => {
        const pd = new Date(p.created_at);
        return pd.getMonth() === m && pd.getFullYear() === y;
      });
      months.push({
        mes: MONTH_LABELS[m],
        faturamento: monthPedidos.reduce((s, p) => s + Number(p.valor_total || 0), 0),
        pedidos: monthPedidos.length,
      });
    }
    return months;
  }, [pedidos, curMonth, curYear]);

  /* ── Distribuição por tipo de item ── */
  const tipoData = useMemo(() => {
    const counts: Record<string, number> = {};
    pedidos.forEach((p) =>
      p.itens.forEach((it) => {
        const key = it.tipo === "bolo" ? "Bolo" : "Doce";
        counts[key] = (counts[key] || 0) + 1;
      })
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [pedidos]);

  /* ── Funil de status ── */
  const statusData = useMemo(() => [
    {
      status: "Novo",
      qtd: pedidos.filter((p) => p.status === "novo").length,
    },
    {
      status: "Em orçamento",
      qtd: pedidos.filter((p) => p.status === "em_orcamento").length,
    },
    {
      status: "Finalizado",
      qtd: pedidos.filter((p) => p.status === "finalizado").length,
    },
  ], [pedidos]);

  /* ── Sabores/massas mais pedidos ── */
  const topSabores = useMemo(() => {
    const counts: Record<string, number> = {};
    pedidos.forEach((p) =>
      p.itens.forEach((it) => {
        if (it.tipo === "doce") {
          const raw =
            (it as any).sabor ??
            (it as any).sabores ??
            "";
          const list = Array.isArray(raw)
            ? raw
            : typeof raw === "string"
              ? raw.split(",")
              : [];
          list.forEach((s) => {
            const key = String(s).trim();
            if (key) counts[key] = (counts[key] || 0) + 1;
          });
        }
        if (it.tipo === "bolo" && it.massa) {
          counts[`Massa: ${it.massa.trim()}`] = (counts[`Massa: ${it.massa.trim()}`] || 0) + 1;
        }
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [pedidos]);

  /* ── Clientes que mais pedem ── */
  const topClientes = useMemo(() => {
    const counts: Record<string, { qtd: number; total: number }> = {};
    pedidos.forEach((p) => {
      if (!counts[p.nome_cliente]) counts[p.nome_cliente] = { qtd: 0, total: 0 };
      counts[p.nome_cliente].qtd += 1;
      counts[p.nome_cliente].total += Number(p.valor_total || 0);
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].qtd - a[1].qtd)
      .slice(0, 5);
  }, [pedidos]);

  const trendFat = calcTrend(faturamentoMes, faturamentoPrevMes);
  const trendPed = calcTrend(thisMonthPedidos.length, prevMonthPedidos.length);

  return (
    <div className="space-y-8">
      {/* ── KPIs row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Faturamento este mês"
          value={fmtMoney(faturamentoMes)}
          sub="vs mês anterior"
          trend={trendFat}
          highlight
          icon={<DollarSign size={15} />}
        />
        <KpiCard
          label="Pedidos este mês"
          value={String(thisMonthPedidos.length)}
          sub="vs mês anterior"
          trend={trendPed}
          icon={<ShoppingBag size={15} />}
        />
        <KpiCard
          label="Ticket médio"
          value={fmtMoney(ticketMedio)}
          sub="pedidos com valor"
          icon={<TrendingUp size={15} />}
        />
        <KpiCard
          label="Taxa de conversão"
          value={`${taxaConversao.toFixed(1)}%`}
          sub="pedidos finalizados"
          icon={<CheckCircle2 size={15} />}
        />
      </div>

      {/* ── Faturamento + Pedidos row ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Faturamento por mês */}
        <div className="rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-burgundy/70">
                Faturamento
              </p>
              <p className="mt-1 font-serif text-xl text-petrol">Desde maio/2026</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy/8">
              <BarChart3 size={16} className="text-burgundy" />
            </span>
          </div>
          <FaturamentoChart data={monthlyData} />
        </div>

        {/* Trend de pedidos */}
        <div className="rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft lg:col-span-2">
          <div className="mb-5">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-burgundy/70">
              Volume
            </p>
            <p className="mt-1 font-serif text-xl text-petrol">Desde maio/2026</p>
          </div>
          <PedidosTrendChart data={monthlyData} />
        </div>
      </div>

      {/* ── Distribuição + Funil row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tipo de item */}
        <div className="rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-burgundy/70">
            Composição
          </p>
          <p className="mt-1 font-serif text-xl text-petrol">Bolos vs Doces</p>
          <div className="mt-4">
            {tipoData.length > 0 ? (
              <TipoDistChart data={tipoData} />
            ) : (
              <p className="py-10 text-center text-sm text-petrol/40">Sem dados</p>
            )}
          </div>
        </div>

        {/* Funil de status */}
        <div className="rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-burgundy/70">
            Pipeline
          </p>
          <p className="mt-1 font-serif text-xl text-petrol">Funil de status</p>
          <div className="mt-6">
            <StatusFunilChart data={statusData} />
          </div>
          <div className="mt-4 border-t border-burgundy/10 pt-4">
            <p className="text-xs text-petrol/50">
              Total de pedidos: <strong className="text-petrol">{pedidos.length}</strong>
            </p>
            <p className="mt-1 text-xs text-petrol/50">
              Faturamento total:{" "}
              <strong className="text-burgundy">{fmtMoney(faturamentoTotal)}</strong>
            </p>
          </div>
        </div>

        {/* Top sabores/massas */}
        <div className="rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-burgundy/70">
            Mais pedidos
          </p>
          <p className="mt-1 font-serif text-xl text-petrol">Sabores & massas</p>
          <ul className="mt-5 space-y-3">
            {topSabores.length === 0 && (
              <p className="text-sm text-petrol/40">Sem dados suficientes</p>
            )}
            {topSabores.map(([sabor, count], i) => {
              const pct = topSabores[0][1] > 0 ? (count / topSabores[0][1]) * 100 : 0;
              return (
                <li key={sabor}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-petrol/70 truncate max-w-[130px]">{sabor}</span>
                    <span className="text-xs font-semibold text-petrol">{count}×</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-burgundy/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: i === 0 ? "hsl(352,65%,32%)" : i === 1 ? "hsl(200,45%,28%)" : "hsl(36,55%,55%)",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Top clientes row ── */}
      <div className="rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-burgundy/70">
              CRM
            </p>
            <p className="mt-1 font-serif text-xl text-petrol">Clientes que mais pedem</p>
          </div>
          <Clock size={16} className="text-burgundy/40" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-burgundy/10">
                <th className="pb-3 text-left text-[0.6rem] font-medium uppercase tracking-[0.25em] text-petrol/50">
                  Cliente
                </th>
                <th className="pb-3 text-center text-[0.6rem] font-medium uppercase tracking-[0.25em] text-petrol/50">
                  Pedidos
                </th>
                <th className="pb-3 text-right text-[0.6rem] font-medium uppercase tracking-[0.25em] text-petrol/50">
                  Total gasto
                </th>
              </tr>
            </thead>
            <tbody>
              {topClientes.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-petrol/40">
                    Nenhum pedido registrado
                  </td>
                </tr>
              )}
              {topClientes.map(([nome, data], i) => (
                <tr key={nome} className="border-b border-burgundy/6 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold text-cream"
                        style={{ background: i === 0 ? "hsl(352,65%,32%)" : i === 1 ? "hsl(200,45%,28%)" : "hsl(36,55%,55%)" }}
                      >
                        {nome.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-petrol">{nome}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="rounded-full border border-burgundy/20 px-2.5 py-0.5 text-xs text-burgundy">
                      {data.qtd} pedido{data.qtd !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-4 text-right font-medium text-petrol">
                    {fmtMoney(data.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
