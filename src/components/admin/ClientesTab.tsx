import { useMemo, useState } from "react";
import { Search, Phone, MapPin, Calendar, TrendingUp } from "lucide-react";
import type { OrderItem } from "@/types/order";

type PedidoRow = {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  data_evento: string;
  itens: OrderItem[];
  status: "novo" | "em_orcamento" | "finalizado";
  valor_total: number | null;
  created_at: string;
  tipo_logistica?: string | null;
};

type Cliente = {
  nome: string;
  telefone: string;
  endereco: string;
  pedidos: PedidoRow[];
  totalGasto: number;
  ultimoPedido: string;
};

const fmtMoney = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const statusColors = {
  novo: "bg-burgundy text-cream",
  em_orcamento: "bg-petrol text-cream",
  finalizado: "bg-gold/80 text-petrol",
} as const;

const statusLabels = {
  novo: "Novo",
  em_orcamento: "Em orçamento",
  finalizado: "Finalizado",
} as const;

export function ClientesTab({ pedidos }: { pedidos: PedidoRow[] }) {
  const [search, setSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  /* Agrupa pedidos por cliente (nome + telefone) */
  const clientes = useMemo<Cliente[]>(() => {
    const map: Record<string, Cliente> = {};
    pedidos.forEach((p) => {
      const key = `${p.nome_cliente.toLowerCase()}|${p.telefone}`;
      if (!map[key]) {
        map[key] = {
          nome: p.nome_cliente,
          telefone: p.telefone,
          endereco: p.endereco,
          pedidos: [],
          totalGasto: 0,
          ultimoPedido: p.created_at,
        };
      }
      map[key].pedidos.push(p);
      map[key].totalGasto += Number(p.valor_total || 0);
      if (p.created_at > map[key].ultimoPedido) {
        map[key].ultimoPedido = p.created_at;
      }
    });
    return Object.values(map).sort(
      (a, b) => new Date(b.ultimoPedido).getTime() - new Date(a.ultimoPedido).getTime()
    );
  }, [pedidos]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clientes;
    const q = search.toLowerCase();
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(q) || c.telefone.includes(q)
    );
  }, [clientes, search]);

  return (
    <div className="flex gap-6 lg:h-[calc(100vh-280px)]">
      {/* ── Lista de clientes ── */}
      <div
        className={`flex flex-col rounded-2xl border border-burgundy/12 bg-cream shadow-soft transition-all duration-300 ${
          selectedCliente ? "hidden lg:flex lg:w-80 lg:shrink-0" : "w-full"
        }`}
      >
        {/* Busca */}
        <div className="border-b border-burgundy/10 p-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-burgundy/15 bg-background px-3.5 py-2.5">
            <Search size={14} className="text-petrol/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente ou telefone…"
              className="w-full bg-transparent text-sm text-petrol placeholder:text-petrol/35 focus:outline-none"
            />
          </div>
          <p className="mt-2 text-[0.65rem] text-petrol/40">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-petrol/40">Nenhum cliente encontrado.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={`${c.nome}|${c.telefone}`}
                onClick={() => setSelectedCliente(c)}
                className={`w-full border-b border-burgundy/6 p-4 text-left transition-all last:border-0 hover:bg-burgundy/4 ${
                  selectedCliente?.telefone === c.telefone && selectedCliente?.nome === c.nome
                    ? "bg-burgundy/8"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-burgundy text-sm font-bold text-cream">
                      {c.nome.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium text-petrol leading-tight">{c.nome}</p>
                      <p className="mt-0.5 text-xs text-petrol/50">{c.telefone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-burgundy">
                      {c.pedidos.length}×
                    </span>
                    <p className="mt-0.5 text-[0.6rem] text-petrol/40">
                      {fmtMoney(c.totalGasto)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Detalhe do cliente ── */}
      {selectedCliente ? (
        <div className="flex-1 overflow-y-auto rounded-2xl border border-burgundy/12 bg-cream p-6 shadow-soft">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy text-xl font-bold text-cream">
                {selectedCliente.nome.charAt(0).toUpperCase()}
              </span>
              <div>
                <h2 className="font-serif text-2xl text-petrol">{selectedCliente.nome}</h2>
                <p className="mt-0.5 text-sm text-petrol/50">
                  Cliente desde{" "}
                  {new Date(
                    selectedCliente.pedidos[selectedCliente.pedidos.length - 1].created_at
                  ).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCliente(null)}
              className="text-xs uppercase tracking-[0.2em] text-petrol/50 hover:text-burgundy lg:hidden"
            >
              ← voltar
            </button>
          </div>

          {/* Info cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-background p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.25em] text-burgundy/60">
                Pedidos
              </p>
              <p className="mt-2 font-serif text-2xl text-petrol">
                {selectedCliente.pedidos.length}
              </p>
            </div>
            <div className="rounded-xl bg-background p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.25em] text-burgundy/60">
                Total gasto
              </p>
              <p className="mt-2 font-serif text-2xl text-petrol">
                {fmtMoney(selectedCliente.totalGasto)}
              </p>
            </div>
            <div className="rounded-xl bg-background p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.25em] text-burgundy/60">
                Ticket médio
              </p>
              <p className="mt-2 font-serif text-2xl text-petrol">
                {fmtMoney(
                  selectedCliente.totalGasto / selectedCliente.pedidos.length || 0
                )}
              </p>
            </div>
          </div>

          {/* Contato */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-petrol/70">
              <Phone size={14} className="text-burgundy/60" />
              {selectedCliente.telefone}
            </div>
            {selectedCliente.endereco && (
              <div className="flex items-center gap-2 text-sm text-petrol/70">
                <MapPin size={14} className="text-burgundy/60" />
                {selectedCliente.endereco}
              </div>
            )}
          </div>

          {/* Histórico de pedidos */}
          <div className="mt-8">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-burgundy/70">
              Histórico de pedidos
            </p>
            <div className="mt-4 space-y-3">
              {selectedCliente.pedidos
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                .map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-burgundy/10 p-4 transition-all hover:border-burgundy/25"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-burgundy/50" />
                          <span className="text-xs text-petrol/60">
                            {new Date(p.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-petrol/80">
                          {p.itens.length} item(ns) ·{" "}
                          <span className="text-petrol/50">{p.tipo_logistica}</span>
                        </p>
                        <p className="mt-1 text-[0.65rem] text-petrol/40">
                          Evento:{" "}
                          {new Date(p.data_evento + "T00:00").toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.2em] ${statusColors[p.status]}`}
                        >
                          {statusLabels[p.status]}
                        </span>
                        {p.valor_total != null && (
                          <span className="text-sm font-semibold text-burgundy">
                            {fmtMoney(Number(p.valor_total))}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Itens resumo */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.itens.map((it, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-burgundy/15 px-2 py-0.5 text-[0.6rem] text-petrol/60"
                        >
                          {it.tipo === "bolo"
                            ? `🎂 Bolo ${it.massa || ""}`
                            : `🍬 ${it.quantidade || ""}× ${
                                (it as any).sabor ||
                                (Array.isArray((it as any).sabores)
                                  ? (it as any).sabores.join(", ")
                                  : (it as any).sabores) ||
                                "Doce"
                              }`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Insights rápidos */}
          {selectedCliente.pedidos.length > 1 && (
            <div className="mt-6 rounded-xl border border-burgundy/12 bg-burgundy/4 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-burgundy" />
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-burgundy">
                  Insight
                </p>
              </div>
              <p className="mt-2 text-sm text-petrol/70">
                {selectedCliente.nome.split(" ")[0]} é um cliente recorrente com{" "}
                <strong>{selectedCliente.pedidos.length} pedidos</strong>. Total investido:{" "}
                <strong>{fmtMoney(selectedCliente.totalGasto)}</strong>.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center rounded-2xl border border-dashed border-burgundy/20 lg:flex">
          <p className="text-sm text-petrol/40">
            Selecione um cliente para ver os detalhes
          </p>
        </div>
      )}
    </div>
  );
}
