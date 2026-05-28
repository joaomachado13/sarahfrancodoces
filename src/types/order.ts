export type DeliveryMode = "retirada" | "entrega";

export interface CustomerData {
  nome: string;
  telefone: string;
  endereco: string;
}

export interface EventData {
  data: string;
  horario: string;
}

export interface LogisticsData {
  modo: DeliveryMode;
  retirada?: { data: string; horario: string };
  entrega?: { endereco: string; data: string; horario: string };
}

export interface DoceItem {
  id: string;
  tipo: "doce";
  quantidade: number;
  sabor: string;
  corForminha: string;
  observacoes: string;
}

export interface BoloItem {
  id: string;
  tipo: "bolo";
  tamanho: string;
  massa: string;
  recheio: string;
  cobertura: string;
  adicional: string;
  observacoes: string;
}

export type OrderItem = DoceItem | BoloItem;

export interface Order {
  cliente: CustomerData;
  evento: EventData;
  logistica: LogisticsData;
  itens: OrderItem[];
  status: "novo" | "em_orcamento" | "finalizado";
  valorTotal?: number;
}

export const newDoce = (): DoceItem => ({
  id: crypto.randomUUID(),
  tipo: "doce",
  quantidade: 50,
  sabor: "",
  corForminha: "",
  observacoes: "",
});

export const newBolo = (): BoloItem => ({
  id: crypto.randomUUID(),
  tipo: "bolo",
  tamanho: "",
  massa: "",
  recheio: "",
  cobertura: "",
  adicional: "",
  observacoes: "",
});

/** Normaliza campo que pode vir como string (pedidos antigos) ou string[] (novos). */
export const asList = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};
