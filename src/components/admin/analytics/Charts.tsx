import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ─── colour tokens ─── */
const BURGUNDY = "hsl(352, 65%, 32%)";
const BURGUNDY_SOFT = "hsl(352, 55%, 48%)";
const PETROL = "hsl(200, 45%, 28%)";
const PETROL_SOFT = "hsl(200, 30%, 48%)";
const GOLD = "hsl(36, 55%, 55%)";
const CREAM_DEEP = "hsl(25, 45%, 80%)";

const PIE_COLORS = [BURGUNDY, PETROL, GOLD, BURGUNDY_SOFT, PETROL_SOFT, CREAM_DEEP];

/* ─── shared tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-burgundy/15 bg-cream px-4 py-3 shadow-elegant">
      {label && (
        <p className="mb-2 text-[0.65rem] uppercase tracking-[0.25em] text-burgundy/60">{label}</p>
      )}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium text-petrol">
          <span style={{ color: entry.color }} className="mr-1">
            ●
          </span>
          {entry.name}:{" "}
          {typeof entry.value === "number" && entry.name?.toLowerCase().includes("r$")
            ? `R$ ${entry.value.toFixed(2)}`
            : entry.value}
        </p>
      ))}
    </div>
  );
};

/* ─── Faturamento por mês (bar) ─── */
interface MonthRevenue {
  mes: string;
  faturamento: number;
  pedidos: number;
}
export function FaturamentoChart({ data }: { data: MonthRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(28 30% 80% / 0.6)" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: "hsl(200 45% 16% / 0.5)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(200 45% 16% / 0.5)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(352 65% 32% / 0.05)" }} />
        <Bar dataKey="faturamento" name="R$ Faturamento" fill={BURGUNDY} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Pedidos por mês (line) ─── */
export function PedidosTrendChart({ data }: { data: MonthRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(28 30% 80% / 0.6)" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: "hsl(200 45% 16% / 0.5)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "hsl(200 45% 16% / 0.5)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="pedidos"
          name="Pedidos"
          stroke={PETROL}
          strokeWidth={2.5}
          dot={{ fill: PETROL, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: BURGUNDY, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Distribuição por tipo (pie) ─── */
interface TipoDist {
  name: string;
  value: number;
}
export function TipoDistChart({ data }: { data: TipoDist[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: "hsl(200 45% 16% / 0.7)", fontFamily: "Inter" }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ─── Status funil (bar horizontal) ─── */
interface StatusCount {
  status: string;
  qtd: number;
}
export function StatusFunilChart({ data }: { data: StatusCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="status"
          tick={{ fontSize: 11, fill: "hsl(200 45% 16% / 0.6)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(352 65% 32% / 0.05)" }} />
        <Bar dataKey="qtd" name="Pedidos" fill={BURGUNDY} radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? BURGUNDY : i === 1 ? PETROL : GOLD}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
