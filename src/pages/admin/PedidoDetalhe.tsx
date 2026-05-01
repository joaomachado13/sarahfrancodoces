import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Phone, User, Package, Truck, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { OrderItem } from "@/types/order";
import type { PedidoRow } from "./AdminDashboard";

const fmtDate = (d?: string | null) =>
  d ? new Date(`${d}T00:00`).toLocaleDateString("pt-BR") : "—";
const fmtMoney = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
    : "—";
const fmtDateTime = (d: string) => new Date(d).toLocaleString("pt-BR");

const statusLabel = {
  novo: "Novo",
  em_orcamento: "Em orçamento",
  finalizado: "Finalizado",
} as const;

const statusColor = {
  novo: "bg-burgundy text-cream",
  em_orcamento: "bg-petrol text-cream",
  finalizado: "border border-gold/50 bg-gold/20 text-petrol",
} as const;

const ItemCard = ({ item, idx }: { item: OrderItem; idx: number }) => (
  <div className="rounded-xl border border-burgundy/15 bg-cream/40 p-5">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-burgundy">
        Item {idx + 1} — {item.tipo === "doce" ? "Doce" : "Bolo"}
      </span>
    </div>
    {item.tipo === "doce" ? (
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-petrol/60">Quantidade</dt><dd className="font-semibold text-petrol">{item.quantidade}</dd></div>
        <div><dt className="text-petrol/60">Sabores</dt><dd className="font-semibold text-petrol">{item.sabores || "—"}</dd></div>
        <div><dt className="text-petrol/60">Cor da forminha</dt><dd className="font-semibold text-petrol">{item.corForminha || "—"}</dd></div>
        {item.observacoes && <div className="sm:col-span-2"><dt className="text-petrol/60">Observações</dt><dd className="text-petrol">{item.observacoes}</dd></div>}
      </dl>
    ) : (
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-petrol/60">Tamanho</dt><dd className="font-semibold text-petrol">{item.tamanho || "—"}</dd></div>
        <div><dt className="text-petrol/60">Massa</dt><dd className="font-semibold text-petrol">{item.massa || "—"}</dd></div>
        <div><dt className="text-petrol/60">Recheio</dt><dd className="font-semibold text-petrol">{item.recheio || "—"}</dd></div>
        <div><dt className="text-petrol/60">Cobertura</dt><dd className="font-semibold text-petrol">{item.cobertura || "—"}</dd></div>
        {item.observacoes && <div className="sm:col-span-2"><dt className="text-petrol/60">Observações</dt><dd className="text-petrol">{item.observacoes}</dd></div>}
      </dl>
    )}
  </div>
);

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-burgundy/15 bg-white p-6 shadow-sm">
    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-burgundy">
      <Icon className="h-4 w-4" /> {title}
    </h2>
    {children}
  </section>
);

const Field = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-petrol/60">{label}</dt>
    <dd className="mt-1 text-petrol">{value || "—"}</dd>
  </div>
);

const PedidoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<PedidoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("pedidos").select("*").eq("id", id).maybeSingle();
      if (error) setError(error.message);
      else if (!data) setError("Pedido não encontrado.");
      else setPedido(data as unknown as PedidoRow);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-cream/40 text-petrol">Carregando…</div>;
  if (error || !pedido)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream/40 px-4 text-petrol">
        <p>{error || "Pedido não encontrado."}</p>
        <Link to="/admin/pedidos" className="text-burgundy underline">Voltar ao painel</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-cream/40 pb-16">
      <header className="border-b border-burgundy/15 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link to="/admin/pedidos" className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:opacity-80">
            <ArrowLeft className="h-4 w-4" /> Painel de pedidos
          </Link>
          <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${statusColor[pedido.status]}`}>
            {statusLabel[pedido.status]}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 pt-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-petrol/60">Pedido</p>
          <h1 className="font-display text-3xl text-burgundy">{pedido.nome_cliente}</h1>
          <p className="mt-1 text-sm text-petrol/70">Recebido em {fmtDateTime(pedido.created_at)}</p>
          <p className="mt-1 break-all text-xs text-petrol/50">ID: {pedido.id}</p>
        </div>

        <Section icon={User} title="Cliente">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome" value={pedido.nome_cliente} />
            <Field label={<span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> Telefone</span>} value={pedido.telefone} />
            <div className="sm:col-span-2"><Field label="Endereço" value={pedido.endereco} /></div>
          </dl>
        </Section>

        <Section icon={Calendar} title="Evento">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Data" value={fmtDate(pedido.data_evento)} />
            <Field label="Horário" value={pedido.horario_evento} />
          </dl>
        </Section>

        <Section icon={pedido.tipo_logistica === "entrega" ? Truck : MapPin} title={pedido.tipo_logistica === "entrega" ? "Entrega" : "Retirada"}>
          {pedido.tipo_logistica === "entrega" ? (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Endereço de entrega" value={pedido.endereco_entrega} /></div>
              <Field label="Data" value={fmtDate(pedido.data_entrega)} />
              <Field label="Horário" value={pedido.horario_entrega} />
            </dl>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Data" value={fmtDate(pedido.data_retirada)} />
              <Field label="Horário" value={pedido.horario_retirada} />
            </dl>
          )}
        </Section>

        <Section icon={Package} title={`Itens do pedido (${pedido.itens?.length || 0})`}>
          <div className="space-y-3">
            {(pedido.itens || []).map((item, idx) => (
              <ItemCard key={idx} item={item} idx={idx} />
            ))}
          </div>
        </Section>

        <Section icon={FileText} title="Orçamento e observações">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Valor total" value={<span className="font-bold text-burgundy">{fmtMoney(pedido.valor_total)}</span>} />
            <Field label="Recebido em" value={fmtDateTime(pedido.created_at)} />
            <div className="sm:col-span-2"><Field label="Observações do admin" value={pedido.observacoes_admin} /></div>
          </dl>
        </Section>
      </main>
    </div>
  );
};

export default PedidoDetalhe;