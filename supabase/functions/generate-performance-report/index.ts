import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseBody(input: unknown) {
  if (!input || typeof input !== "object") return { monthsBack: 6 };
  const rawMonthsBack = (input as { monthsBack?: unknown }).monthsBack;
  if (rawMonthsBack == null) return { monthsBack: 6 };
  if (typeof rawMonthsBack !== "number" || !Number.isInteger(rawMonthsBack) || rawMonthsBack < 3 || rawMonthsBack > 24) {
    throw new Error("monthsBack deve ser um número inteiro entre 3 e 24.");
  }
  return { monthsBack: rawMonthsBack };
}

const InsightSchema = {
  type: "function",
  function: {
    name: "generate_report_insights",
    description: "Gera um resumo executivo e recomendações práticas a partir dos indicadores do negócio.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        strengths: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        improvements: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        actions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
      },
      required: ["summary", "strengths", "improvements", "actions"],
    },
  },
} as const;

type PedidoRow = {
  id: string;
  status: "novo" | "em_orcamento" | "finalizado" | string;
  valor_total: number | null;
  itens: Array<Record<string, unknown>> | null;
  created_at: string;
  data_evento: string;
};

type MonthMetric = {
  key: string;
  label: string;
  totalPedidos: number;
  faturamento: number;
  ticketMedio: number;
};

type StatusKey = "novo" | "em_orcamento" | "finalizado";

const ADMIN_START_DATE = "2026-05-01";

const statusLabels: Record<StatusKey, string> = {
  novo: "Novo",
  em_orcamento: "Em orçamento",
  finalizado: "Finalizado",
};

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function getMonthKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

function toCurrencyNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function createMonthSeries(pedidos: PedidoRow[], monthsBack: number): MonthMetric[] {
  const now = new Date();
  const monthKeys: string[] = [];

  for (let offset = monthsBack - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    monthKeys.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  return monthKeys.map((monthKey) => {
    const monthPedidos = pedidos.filter((pedido) => getMonthKey(pedido.created_at) === monthKey);
    const faturamento = monthPedidos.reduce((sum, pedido) => sum + toCurrencyNumber(pedido.valor_total), 0);
    const pedidosComValor = monthPedidos.filter((pedido) => pedido.valor_total != null).length;

    return {
      key: monthKey,
      label: getMonthLabel(monthKey),
      totalPedidos: monthPedidos.length,
      faturamento: round(faturamento),
      ticketMedio: pedidosComValor > 0 ? round(faturamento / pedidosComValor) : 0,
    };
  });
}

function buildFallbackInsights(input: {
  totalPedidos: number;
  crescimentoMensal: number;
  taxaConversao: number;
  ticketMedio: number;
  faturamentoEstimado: number;
  topStatus: string;
  topCategoria: string;
}) {
  const growthText = input.crescimentoMensal > 0
    ? `houve crescimento de ${round(input.crescimentoMensal)}% em relação ao mês anterior`
    : input.crescimentoMensal < 0
      ? `houve retração de ${Math.abs(round(input.crescimentoMensal))}% em relação ao mês anterior`
      : "o volume de pedidos se manteve estável em relação ao mês anterior";

  return {
    summary: `Foram analisados ${input.totalPedidos} pedidos e ${growthText}. O ticket médio atual está em R$ ${input.ticketMedio.toFixed(2)} e o faturamento estimado acumulado soma R$ ${input.faturamentoEstimado.toFixed(2)}.`,
    strengths: [
      `O status com maior concentração é ${input.topStatus}, o que ajuda a visualizar o estágio predominante da operação.`,
      `A categoria com maior presença é ${input.topCategoria}, sinalizando um eixo claro de demanda do negócio.`,
      `A taxa de conversão atual está em ${round(input.taxaConversao)}%, oferecendo base para acompanhar evolução comercial.`,
    ],
    improvements: [
      "Criar acompanhamentos para pedidos ainda em aberto pode acelerar conversões e reduzir perda de oportunidades.",
      "Padronizar ofertas com maior margem ajuda a elevar o ticket médio sem aumentar a complexidade operacional.",
      "Monitorar sazonalidade mensal facilita prever picos de produção e organizar compras com antecedência.",
    ],
    actions: [
      "Montar combos prontos para eventos com faixa de preço definida para estimular upgrades.",
      "Revisar mensalmente os pedidos em orçamento e disparar lembretes para clientes com decisão pendente.",
      "Destacar os produtos mais recorrentes na comunicação para converter interesse em pedidos fechados mais rápido.",
    ],
  };
}

async function generateInsightsWithAi(metrics: Record<string, unknown>, fallback: ReturnType<typeof buildFallbackInsights>) {
  try {
    const LOVABLE_API_KEY = getEnv("LOVABLE_API_KEY");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Você é um analista de desempenho de uma confeitaria. Gere conclusões objetivas, úteis e práticas em português do Brasil, sem inventar dados ausentes.",
          },
          {
            role: "user",
            content: `Analise estes indicadores e gere um resumo executivo, pontos fortes, pontos de melhoria e ações práticas: ${JSON.stringify(metrics)}`,
          },
        ],
        tools: [InsightSchema],
        tool_choice: { type: "function", function: { name: "generate_report_insights" } },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway failed [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI response missing tool arguments");

    const parsed = JSON.parse(args);
    return {
      summary: parsed.summary || fallback.summary,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : fallback.strengths,
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length ? parsed.improvements : fallback.improvements,
      actions: Array.isArray(parsed.actions) && parsed.actions.length ? parsed.actions : fallback.actions,
      source: "ai" as const,
    };
  } catch (error) {
    console.error("[generate-performance-report] ai fallback:", error);
    return { ...fallback, source: "fallback" as const };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    const bodyRaw = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    let body;
    try {
      body = parseBody(bodyRaw);
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Parâmetros inválidos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Autenticação obrigatória." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await serviceClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso restrito ao painel administrativo." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await serviceClient
      .from("pedidos")
      .select("id, status, valor_total, itens, created_at, data_evento")
      .gte("created_at", ADMIN_START_DATE)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Pedidos query failed: ${error.message}`);
    }

    const pedidos = (data || []) as PedidoRow[];
    const monthsBack = body.monthsBack;
    const monthSeries = createMonthSeries(pedidos, monthsBack);

    const totalPedidos = pedidos.length;
    const pedidosPorStatus = {
      novo: pedidos.filter((pedido) => pedido.status === "novo").length,
      em_orcamento: pedidos.filter((pedido) => pedido.status === "em_orcamento").length,
      finalizado: pedidos.filter((pedido) => pedido.status === "finalizado").length,
    };

    const pedidosComValor = pedidos.filter((pedido) => pedido.valor_total != null);
    const faturamentoEstimado = round(
      pedidosComValor.reduce((sum, pedido) => sum + toCurrencyNumber(pedido.valor_total), 0),
    );
    const ticketMedio = pedidosComValor.length
      ? round(faturamentoEstimado / pedidosComValor.length)
      : 0;

    const lastMonth = monthSeries[monthSeries.length - 1]?.totalPedidos ?? 0;
    const previousMonth = monthSeries[monthSeries.length - 2]?.totalPedidos ?? 0;
    const crescimentoMensal = previousMonth > 0
      ? round(((lastMonth - previousMonth) / previousMonth) * 100)
      : lastMonth > 0
        ? 100
        : 0;

    const taxaConversao = totalPedidos > 0
      ? round((pedidosPorStatus.finalizado / totalPedidos) * 100)
      : 0;

    const mediaPedidosPorPeriodo = monthSeries.length
      ? round(totalPedidos / monthSeries.length)
      : 0;

    const categoriaResumo = pedidos.reduce(
      (acc, pedido) => {
        const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
        itens.forEach((item) => {
          const tipo = item?.tipo;
          if (tipo === "doce") acc.doces += 1;
          if (tipo === "bolo") acc.bolos += 1;
        });
        return acc;
      },
      { doces: 0, bolos: 0 },
    );

    const topStatusKey = (Object.entries(pedidosPorStatus).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "novo") as StatusKey;
    const topCategoria = categoriaResumo.doces >= categoriaResumo.bolos ? "doces" : "bolos";

    const metricsPayload = {
      periodo_analisado: monthSeries.map((month) => month.label),
      total_pedidos: totalPedidos,
      pedidos_por_mes: monthSeries,
      pedidos_por_status: {
        Novo: pedidosPorStatus.novo,
        "Em orçamento": pedidosPorStatus.em_orcamento,
        Finalizado: pedidosPorStatus.finalizado,
      },
      ticket_medio: ticketMedio,
      faturamento_estimado: faturamentoEstimado,
      crescimento_mensal_percentual: crescimentoMensal,
      taxa_conversao_percentual: taxaConversao,
      media_de_pedidos_por_periodo: mediaPedidosPorPeriodo,
      mix_produtos: categoriaResumo,
    };

    const fallback = buildFallbackInsights({
      totalPedidos,
      crescimentoMensal,
      taxaConversao,
      ticketMedio,
      faturamentoEstimado,
      topStatus: statusLabels[topStatusKey],
      topCategoria,
    });

    const insights = await generateInsightsWithAi(metricsPayload, fallback);

    return new Response(JSON.stringify({
      generatedAt: new Date().toISOString(),
      metrics: {
        totalPedidos,
        ticketMedio,
        faturamentoEstimado,
        crescimentoMensal,
        taxaConversao,
        mediaPedidosPorPeriodo,
        pedidosPorStatus,
        pedidosPorMes: monthSeries,
        mixProdutos: categoriaResumo,
      },
      insights,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[generate-performance-report] error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
