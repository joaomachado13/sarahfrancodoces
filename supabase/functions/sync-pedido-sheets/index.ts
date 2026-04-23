const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";
const SPREADSHEET_ID = "1QjhHO-ZhZ_Kfh20d7E5CyHcAMoLTPbAEBJOzSzwrv9A";

const SHEETS = {
  novo: "Novos_Pedidos",
  em_orcamento: "Em_Orcamento",
  finalizado: "Finalizados",
} as const;

const HEADERS = [
  "ID do pedido",
  "Data",
  "Nome do cliente",
  "Telefone",
  "Tipo",
  "Data do evento",
  "Resumo dos itens",
  "Status",
  "Observações",
];

type Status = keyof typeof SHEETS;

interface Item {
  tipo: "doce" | "bolo";
  quantidade?: number;
  sabores?: string;
  tamanho?: string;
  massa?: string;
  recheio?: string;
  cobertura?: string;
  observacoes?: string;
}

interface Payload {
  id: string;
  nome_cliente: string;
  telefone: string;
  tipo_logistica: string;
  data_evento: string;
  itens: Item[];
  status: Status;
  observacoes_admin?: string | null;
  created_at?: string;
}

function getEnv() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY is not configured");
  return { LOVABLE_API_KEY, GOOGLE_SHEETS_API_KEY };
}

function authHeaders() {
  const { LOVABLE_API_KEY, GOOGLE_SHEETS_API_KEY } = getEnv();
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
    "Content-Type": "application/json",
  };
}

function resumirItens(itens: Item[]): string {
  return itens
    .map((it, idx) => {
      if (it.tipo === "doce") {
        return `${idx + 1}. ${it.quantidade ?? ""} doces (${it.sabores || "sabores a definir"})`;
      }
      return `${idx + 1}. Bolo ${it.tamanho || ""} - ${it.massa || ""}/${it.recheio || ""}/${it.cobertura || ""}`;
    })
    .join(" | ");
}

function formatDate(d?: string): string {
  if (!d) return "";
  try {
    const date = new Date(d.includes("T") ? d : d + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  } catch {
    return d;
  }
}

async function getSpreadsheet() {
  const res = await fetch(`${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Sheets get spreadsheet failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

function quoteRange(title: string, cells: string): string {
  return `'${title.replace(/'/g, "''")}'!${cells}`;
}

async function ensureSheetsExist() {
  const spreadsheet = await getSpreadsheet();
  const existingTitles: string[] = (spreadsheet.sheets || []).map(
    (s: any) => s.properties?.title
  );

  const requests: any[] = [];
  for (const title of Object.values(SHEETS)) {
    if (!existingTitles.includes(title)) {
      requests.push({ addSheet: { properties: { title } } });
    }
  }

  if (requests.length > 0) {
    const res = await fetch(`${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ requests }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Sheets create tabs failed [${res.status}]: ${JSON.stringify(data)}`);
    }
  }

  // Garantir cabeçalhos
  for (const title of Object.values(SHEETS)) {
    const range = quoteRange(title, "A1:I1");
    const res = await fetch(`${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${range}`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    const hasHeader = data.values && data.values[0] && data.values[0].length > 0;
    if (!hasHeader) {
      const putRes = await fetch(
        `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ values: [HEADERS] }),
        }
      );
      const putData = await putRes.json();
      if (!putRes.ok) {
        throw new Error(`Sheets header write failed [${putRes.status}]: ${JSON.stringify(putData)}`);
      }
    }
  }
}

async function findRowByPedidoId(sheetTitle: string, pedidoId: string): Promise<number | null> {
  const range = quoteRange(sheetTitle, "A:A");
  const res = await fetch(`${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${range}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) return null;
  const values: string[][] = data.values || [];
  for (let i = 0; i < values.length; i++) {
    if (values[i]?.[0] === pedidoId) return i + 1; // linha 1-indexed
  }
  return null;
}

async function deleteRow(sheetTitle: string, rowNumber: number) {
  const spreadsheet = await getSpreadsheet();
  const sheet = (spreadsheet.sheets || []).find(
    (s: any) => s.properties?.title === sheetTitle
  );
  if (!sheet) return;
  const sheetId = sheet.properties.sheetId;

  const res = await fetch(`${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Sheets delete row failed [${res.status}]: ${JSON.stringify(data)}`);
  }
}

async function appendRow(sheetTitle: string, row: (string | number)[]) {
  const range = quoteRange(sheetTitle, "A:I");
  const res = await fetch(
    `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ values: [row] }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Sheets append failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

function statusLabel(s: Status): string {
  return s === "novo" ? "Novo" : s === "em_orcamento" ? "Em Orçamento" : "Finalizado";
}

async function syncPedido(payload: Payload) {
  await ensureSheetsExist();

  const targetSheet = SHEETS[payload.status];
  if (!targetSheet) throw new Error(`Status inválido: ${payload.status}`);

  // Remove o pedido das outras abas para evitar duplicação
  for (const [status, title] of Object.entries(SHEETS)) {
    if (status === payload.status) continue;
    const row = await findRowByPedidoId(title, payload.id);
    if (row && row > 1) {
      await deleteRow(title, row);
    }
  }

  // Verifica se já existe na aba destino — se sim, remove para reescrever (upsert)
  const existingRow = await findRowByPedidoId(targetSheet, payload.id);
  if (existingRow && existingRow > 1) {
    await deleteRow(targetSheet, existingRow);
  }

  const row: (string | number)[] = [
    payload.id,
    formatDate(payload.created_at || new Date().toISOString()),
    payload.nome_cliente,
    payload.telefone,
    payload.tipo_logistica,
    formatDate(payload.data_evento),
    resumirItens(payload.itens || []),
    statusLabel(payload.status),
    payload.observacoes_admin || "",
  ];

  await appendRow(targetSheet, row);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    if (!body.id || !body.status) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: id, status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await syncPedido(body as Payload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[sync-pedido-sheets] erro:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});