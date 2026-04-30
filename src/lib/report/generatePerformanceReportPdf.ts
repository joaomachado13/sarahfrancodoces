import { jsPDF } from "jspdf";
import type { PerformanceReportData } from "@/lib/report/types";

const BURGUNDY: [number, number, number] = [120, 30, 45];
const PETROL: [number, number, number] = [40, 55, 65];
const PETROL_SOFT: [number, number, number] = [110, 120, 130];
const CREAM: [number, number, number] = [250, 245, 238];
const LINE: [number, number, number] = [200, 175, 175];
const CARD: [number, number, number] = [252, 249, 245];

const fmtMoney = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;
const fmtPct = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1).replace(".", ",")}%`;
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("pt-BR");
type RecentPedido = {
  nome_cliente: string;
  data_evento: string;
  status: "novo" | "em_orcamento" | "finalizado";
  valor_total: number | null;
  itens: unknown[];
  created_at: string;
};

export const generatePerformanceReportPdf = (report: PerformanceReportData, recentes: RecentPedido[] = []) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentW = pageW - margin * 2;
  let y = margin;

  const setTextColor = (rgb: [number, number, number]) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

  const drawFooter = () => {
    const fy = pageH - 36;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(margin, fy - 12, pageW - margin, fy - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(PETROL_SOFT);
    doc.text(`Gerado em ${fmtDateTime(report.generatedAt)}`, margin, fy);
    doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, pageW - margin, fy, { align: "right" });
  };

  const newPage = () => {
    drawFooter();
    doc.addPage();
    y = margin;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 70) newPage();
  };

  const sectionTitle = (title: string, subtitle?: string) => {
    ensureSpace(48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setTextColor(BURGUNDY);
    doc.text(title.toUpperCase(), margin, y, { charSpace: 2 });
    y += 10;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 16;
    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setTextColor(PETROL_SOFT);
      const lines = doc.splitTextToSize(subtitle, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 8;
    }
  };

  const textBlock = (text: string, size = 11, color: [number, number, number] = PETROL) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    setTextColor(color);
    const lines = doc.splitTextToSize(text, contentW);
    ensureSpace(lines.length * (size + 3) + 4);
    doc.text(lines, margin, y);
    y += lines.length * (size + 3) + 4;
  };

  const bulletList = (items: string[]) => {
    items.forEach((item) => {
      const bullet = "•";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setTextColor(PETROL);
      const lines = doc.splitTextToSize(item, contentW - 16);
      ensureSpace(lines.length * 13 + 8);
      doc.text(bullet, margin, y);
      doc.text(lines, margin + 14, y);
      y += lines.length * 13 + 6;
    });
  };

  const metricCard = (x: number, top: number, w: number, title: string, value: string, note: string) => {
    doc.setFillColor(...CARD);
    doc.setDrawColor(...LINE);
    doc.roundedRect(x, top, w, 90, 6, 6, "FD");
    doc.setFillColor(...BURGUNDY);
    doc.rect(x, top, 4, 90, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(BURGUNDY);
    doc.text(title.toUpperCase(), x + 16, top + 20, { charSpace: 1.2 });

    doc.setFont("times", "normal");
    doc.setFontSize(20);
    setTextColor(PETROL);
    doc.text(value, x + 16, top + 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(PETROL_SOFT);
    const noteLines = doc.splitTextToSize(note, w - 24);
    doc.text(noteLines, x + 16, top + 66);
  };

  const drawBarChart = () => {
    const months = report.metrics.pedidosPorMes;
    ensureSpace(210);
    const chartTop = y;
    const chartHeight = 150;
    const chartBottom = chartTop + chartHeight;
    const chartWidth = contentW;
    const maxValue = Math.max(...months.map((month) => month.totalPedidos), 1);
    const barWidth = Math.max(24, Math.min(42, chartWidth / Math.max(months.length * 1.7, 1)));
    const gap = months.length > 1 ? (chartWidth - barWidth * months.length) / (months.length - 1) : 0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(PETROL_SOFT);
    doc.text("Pedidos por mês", margin, chartTop - 8);

    doc.setDrawColor(...LINE);
    doc.line(margin, chartBottom, margin + chartWidth, chartBottom);

    months.forEach((month, index) => {
      const height = (month.totalPedidos / maxValue) * 110;
      const x = margin + index * (barWidth + gap);
      const barTop = chartBottom - height;
      doc.setFillColor(...BURGUNDY);
      doc.roundedRect(x, barTop, barWidth, height, 4, 4, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setTextColor(PETROL);
      doc.text(String(month.totalPedidos), x + barWidth / 2, barTop - 6, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setTextColor(PETROL_SOFT);
      doc.text(month.label, x + barWidth / 2, chartBottom + 14, { align: "center" });
    });

    y = chartBottom + 26;
  };

  const drawStatusChart = () => {
    ensureSpace(130);
    const statuses = [
      { label: "Novo", value: report.metrics.pedidosPorStatus.novo },
      { label: "Em orçamento", value: report.metrics.pedidosPorStatus.em_orcamento },
      { label: "Finalizado", value: report.metrics.pedidosPorStatus.finalizado },
    ];
    const maxValue = Math.max(...statuses.map((status) => status.value), 1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(PETROL_SOFT);
    doc.text("Distribuição por status", margin, y);
    y += 14;

    statuses.forEach((status) => {
      ensureSpace(26);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setTextColor(PETROL);
      doc.text(status.label, margin, y + 10);

      doc.setFillColor(...CARD);
      doc.roundedRect(margin + 100, y, contentW - 150, 12, 4, 4, "F");
      doc.setFillColor(...BURGUNDY);
      doc.roundedRect(margin + 100, y, ((contentW - 150) * status.value) / maxValue, 12, 4, 4, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setTextColor(PETROL);
      doc.text(String(status.value), pageW - margin, y + 10, { align: "right" });
      y += 24;
    });
  };

  doc.setFillColor(...BURGUNDY);
  doc.rect(0, 0, pageW, 112, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.text("Sarah Franco", margin, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("D O C E S   &   B O L O S", margin, 72);
  doc.setFontSize(8);
  doc.text("Relatório analítico em PDF", pageW - margin, 52, { align: "right" });
  doc.text(fmtDateTime(report.generatedAt), pageW - margin, 67, { align: "right" });

  y = 146;
  doc.setFont("times", "normal");
  doc.setFontSize(24);
  setTextColor(PETROL);
  doc.text("Relatório de desempenho", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setTextColor(PETROL_SOFT);
  doc.text("Resumo inteligente das métricas, tendências e recomendações do negócio.", margin, y);
  y += 26;

  sectionTitle("Resumo geral");
  textBlock(report.insights.summary);

  ensureSpace(210);
  const cardWidth = (contentW - 14) / 2;
  const cardsTop = y;
  metricCard(margin, cardsTop, cardWidth, "Total de pedidos", String(report.metrics.totalPedidos), "Base consolidada no período analisado.");
  metricCard(margin + cardWidth + 14, cardsTop, cardWidth, "Faturamento estimado", fmtMoney(report.metrics.faturamentoEstimado), "Soma dos pedidos com valor registrado.");
  metricCard(margin, cardsTop + 104, cardWidth, "Ticket médio", fmtMoney(report.metrics.ticketMedio), "Média dos pedidos com orçamento lançado.");
  metricCard(margin + cardWidth + 14, cardsTop + 104, cardWidth, "Crescimento mensal", fmtPct(report.metrics.crescimentoMensal), `Conversão atual: ${report.metrics.taxaConversao.toFixed(1).replace(".", ",")}%`);
  y = cardsTop + 204;

  sectionTitle("Métricas principais", `Média de pedidos por período: ${report.metrics.mediaPedidosPorPeriodo.toFixed(1).replace(".", ",")} · Mix de produtos: ${report.metrics.mixProdutos.doces} doces e ${report.metrics.mixProdutos.bolos} bolos.`);
  drawBarChart();
  drawStatusChart();

  sectionTitle("Insights da IA", report.insights.source === "ai" ? "Análise enriquecida com IA a partir das métricas atuais." : "A IA não respondeu a tempo; este bloco usa recomendações automáticas seguras.");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor(BURGUNDY);
  doc.text("Pontos fortes", margin, y);
  y += 14;
  bulletList(report.insights.strengths);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor(BURGUNDY);
  doc.text("Pontos de melhoria", margin, y);
  y += 14;
  bulletList(report.insights.improvements);

  sectionTitle("Recomendações finais");
  bulletList(report.insights.actions);

  if (recentes.length > 0) {
    sectionTitle("Pedidos recentes");
    recentes.slice(0, 8).forEach((pedido) => {
      ensureSpace(42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setTextColor(PETROL);
      doc.text(pedido.nome_cliente, margin, y);
      doc.text(pedido.valor_total != null ? fmtMoney(Number(pedido.valor_total)) : "Sem valor", pageW - margin, y, { align: "right" });
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setTextColor(PETROL_SOFT);
      const statusLabel = pedido.status === "novo" ? "Novo" : pedido.status === "em_orcamento" ? "Em orçamento" : "Finalizado";
      doc.text(`${statusLabel} · evento ${new Date(`${pedido.data_evento}T00:00`).toLocaleDateString("pt-BR")} · ${pedido.itens.length} item(ns)`, margin, y);
      y += 14;
    });
  }

  drawFooter();
  doc.save(`relatorio-desempenho-sarah-franco-${report.generatedAt.slice(0, 10)}.pdf`);
};
