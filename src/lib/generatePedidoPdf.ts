import { jsPDF } from "jspdf";
import type { OrderItem } from "@/types/order";

type PedidoPdf = {
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
  valor_total: number | null;
  observacoes_admin: string | null;
  created_at: string;
};

// Paleta (HSL convertida para RGB aproximado, alinhada ao tema)
const BURGUNDY: [number, number, number] = [120, 30, 45];
const PETROL: [number, number, number] = [40, 55, 65];
const PETROL_SOFT: [number, number, number] = [110, 120, 130];
const CREAM: [number, number, number] = [250, 245, 238];
const LINE: [number, number, number] = [200, 175, 175];

const fmtData = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const fmtMoney = (v: number | null | undefined) =>
  v == null ? "—" : `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const generatePedidoPdf = (pedido: PedidoPdf) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 80) {
      drawFooter();
      doc.addPage();
      y = margin;
    }
  };

  const setColor = (rgb: [number, number, number]) =>
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);

  // ===== Header com faixa bordô =====
  doc.setFillColor(...BURGUNDY);
  doc.rect(0, 0, pageW, 110, "F");

  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.text("Sarah Franco", margin, 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.text("D O C E S   &   B O L O S", margin, 74);

  doc.setFontSize(8);
  const dataEmissao = new Date().toLocaleDateString("pt-BR");
  doc.text(`Orçamento emitido em ${dataEmissao}`, pageW - margin, 55, { align: "right" });
  doc.text(`Ref: ${pedido.id.slice(0, 8).toUpperCase()}`, pageW - margin, 70, { align: "right" });

  y = 150;

  // ===== Título do documento =====
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  setColor(PETROL);
  doc.text("Proposta de orçamento", margin, y);
  y += 30;

  doc.setDrawColor(...BURGUNDY);
  doc.setLineWidth(1.2);
  doc.line(margin, y, margin + 40, y);
  y += 24;

  // ===== Helper de seção =====
  const sectionTitle = (title: string) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(BURGUNDY);
    doc.text(title.toUpperCase(), margin, y, { charSpace: 2 });
    y += 8;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageW - margin, y);
    y += 16;
  };

  const row = (label: string, value: string) => {
    ensureSpace(18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(PETROL_SOFT);
    doc.text(label.toUpperCase(), margin, y, { charSpace: 1.2 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    setColor(PETROL);
    const lines = doc.splitTextToSize(value || "—", contentW - 130);
    doc.text(lines, margin + 130, y);
    y += Math.max(16, lines.length * 14);
  };

  // ===== Cliente =====
  sectionTitle("Cliente");
  row("Nome", pedido.nome_cliente);
  row("Telefone", pedido.telefone);
  row("Endereço", pedido.endereco);
  y += 8;

  // ===== Evento =====
  sectionTitle("Evento");
  row("Data", fmtData(pedido.data_evento));
  row("Horário", pedido.horario_evento || "—");
  y += 8;

  // ===== Logística =====
  if (pedido.tipo_logistica === "entrega") {
    sectionTitle("Entrega");
    row("Endereço", pedido.endereco_entrega || "—");
    row("Data", fmtData(pedido.data_entrega));
    row("Horário", pedido.horario_entrega || "—");
  } else {
    sectionTitle("Retirada");
    row("Data", fmtData(pedido.data_retirada));
    row("Horário", pedido.horario_retirada || "—");
  }
  y += 8;

  // ===== Itens =====
  const doces = pedido.itens.filter((i) => i.tipo === "doce");
  const bolos = pedido.itens.filter((i) => i.tipo === "bolo");

  const itemBox = (label: string, body: string[], valor: number | null) => {
    const lineHeight = 13;
    const padY = 14;
    const valueColW = 90;
    const textW = contentW - valueColW - 24;
    const wrapped: string[] = [];
    body.forEach((line) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.splitTextToSize(line, textW).forEach((l: string) => wrapped.push(l));
    });
    const boxH = padY * 2 + 16 + wrapped.length * lineHeight;
    ensureSpace(boxH + 8);

    // Card sutil
    doc.setFillColor(252, 249, 245);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentW, boxH, 4, 4, "FD");

    // Selo lateral
    doc.setFillColor(...BURGUNDY);
    doc.rect(margin, y, 3, boxH, "F");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(BURGUNDY);
    doc.text(label.toUpperCase(), margin + 16, y + padY + 2, { charSpace: 1.5 });

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(PETROL);
    let ty = y + padY + 22;
    wrapped.forEach((l) => {
      doc.text(l, margin + 16, ty);
      ty += lineHeight;
    });

    // Valor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(BURGUNDY);
    doc.text(fmtMoney(valor), pageW - margin - 12, y + padY + 18, { align: "right" });

    y += boxH + 8;
  };

  if (doces.length > 0) {
    sectionTitle(`Doces (${doces.length})`);
    doces.forEach((it, idx) => {
      if (it.tipo !== "doce") return;
      const body = [
        `Quantidade: ${it.quantidade} unidades`,
        `Sabores: ${it.sabores || "—"}`,
        `Cor da forminha: ${it.corForminha || "—"}`,
      ];
      if (it.observacoes) body.push(`Observações: ${it.observacoes}`);
      itemBox(`Doce ${idx + 1}`, body, (it as any).valor ?? null);
    });
    y += 4;
  }

  if (bolos.length > 0) {
    sectionTitle(`Bolos (${bolos.length})`);
    bolos.forEach((it, idx) => {
      if (it.tipo !== "bolo") return;
      const body = [
        `Tamanho: ${it.tamanho || "—"}`,
        `Massa: ${it.massa || "—"}`,
        `Recheio: ${(Array.isArray((it as any).recheios) ? (it as any).recheios.join(", ") : ((it as any).recheio || "")) || "—"}`,
        `Cobertura: ${it.cobertura || "—"}`,
      ];
      if (it.observacoes) body.push(`Observações: ${it.observacoes}`);
      itemBox(`Bolo ${idx + 1}`, body, (it as any).valor ?? null);
    });
    y += 4;
  }

  // ===== Total =====
  ensureSpace(90);
  y += 6;
  doc.setFillColor(...BURGUNDY);
  doc.rect(margin, y, contentW, 56, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.text("VALOR TOTAL", margin + 20, y + 22, { charSpace: 2 });
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.text(fmtMoney(pedido.valor_total), pageW - margin - 20, y + 36, { align: "right" });
  y += 72;

  // ===== Observações =====
  if (pedido.observacoes_admin) {
    sectionTitle("Observações");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(PETROL);
    const lines = doc.splitTextToSize(pedido.observacoes_admin, contentW);
    ensureSpace(lines.length * 14 + 10);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 10;
  }

  // ===== Rodapé =====
  function drawFooter() {
    const fy = pageH - 50;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.4);
    doc.line(margin, fy, pageW - margin, fy);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    setColor(PETROL_SOFT);
    doc.text("Orçamento válido por 7 dias a partir da data de emissão.", margin, fy + 16);
    doc.text("Sarah Franco · Doces & Bolos", pageW - margin, fy + 16, { align: "right" });
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.text(`Página ${pageNum}`, pageW / 2, fy + 30, { align: "center" });
  }

  drawFooter();

  doc.save(`orcamento-sarah-franco-${slug(pedido.nome_cliente) || "pedido"}.pdf`);
};
