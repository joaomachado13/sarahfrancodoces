export type ReportMonthMetric = {
  key: string;
  label: string;
  totalPedidos: number;
  faturamento: number;
  ticketMedio: number;
};

export type ReportInsights = {
  summary: string;
  strengths: string[];
  improvements: string[];
  actions: string[];
  source: "ai" | "fallback";
};

export type PerformanceReportData = {
  generatedAt: string;
  metrics: {
    totalPedidos: number;
    ticketMedio: number;
    faturamentoEstimado: number;
    crescimentoMensal: number;
    taxaConversao: number;
    mediaPedidosPorPeriodo: number;
    pedidosPorStatus: {
      novo: number;
      em_orcamento: number;
      finalizado: number;
    };
    pedidosPorMes: ReportMonthMetric[];
    mixProdutos: {
      doces: number;
      bolos: number;
    };
  };
  insights: ReportInsights;
};
