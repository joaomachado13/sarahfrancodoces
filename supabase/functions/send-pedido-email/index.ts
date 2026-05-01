import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const TO_EMAIL = "sarahalfr@hotmail.com";
const APP_BASE_URL = "https://sarahfrancodoces.lovable.app";

interface DoceItem {
  tipo: "doce";
  quantidade: number;
  sabores: string;
  corForminha: string;
  observacoes: string;
}

interface BoloItem {
  tipo: "bolo";
  tamanho: string;
  massa: string;
  recheio: string;
  cobertura: string;
  observacoes: string;
}

type OrderItem = DoceItem | BoloItem;

interface Payload {
  id?: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  data_evento: string;
  horario_evento: string;
  tipo_logistica: "entrega" | "retirada";
  endereco_entrega: string | null;
  data_entrega: string | null;
  horario_entrega: string | null;
  data_retirada: string | null;
  horario_retirada: string | null;
  itens: OrderItem[];
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formatDate = (d: string) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const renderItem = (it: OrderItem, idx: number) => {
  if (it.tipo === "doce") {
    return `
      <li style="margin:0 0 12px;padding:12px 14px;background:#fff;border:1px solid #eadfd5;border-radius:10px;">
        <strong style="color:#5a1f2b;">Item ${idx + 1} — Doce</strong><br/>
        Quantidade: <strong>${it.quantidade}</strong><br/>
        Sabores: ${escape(it.sabores || "—")}<br/>
        Cor da forminha: ${escape(it.corForminha || "—")}<br/>
        ${it.observacoes ? `Obs.: ${escape(it.observacoes)}` : ""}
      </li>`;
  }
  return `
    <li style="margin:0 0 12px;padding:12px 14px;background:#fff;border:1px solid #eadfd5;border-radius:10px;">
      <strong style="color:#5a1f2b;">Item ${idx + 1} — Bolo</strong><br/>
      Tamanho: ${escape(it.tamanho || "—")}<br/>
      Massa: ${escape(it.massa || "—")}<br/>
      Recheio: ${escape(it.recheio || "—")}<br/>
      Cobertura: ${escape(it.cobertura || "—")}<br/>
      ${it.observacoes ? `Obs.: ${escape(it.observacoes)}` : ""}
    </li>`;
};

const renderTextItem = (it: OrderItem, idx: number) => {
  if (it.tipo === "doce") {
    return `Item ${idx + 1} — Doce
  Quantidade: ${it.quantidade}
  Sabores: ${it.sabores || "—"}
  Cor da forminha: ${it.corForminha || "—"}${it.observacoes ? `\n  Obs.: ${it.observacoes}` : ""}`;
  }
  return `Item ${idx + 1} — Bolo
  Tamanho: ${it.tamanho || "—"}
  Massa: ${it.massa || "—"}
  Recheio: ${it.recheio || "—"}
  Cobertura: ${it.cobertura || "—"}${it.observacoes ? `\n  Obs.: ${it.observacoes}` : ""}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
    if (!GOOGLE_MAIL_API_KEY) throw new Error("GOOGLE_MAIL_API_KEY is not configured");

    const p = (await req.json()) as Payload;

    const logisticaHtml =
      p.tipo_logistica === "entrega"
        ? `<strong>Entrega</strong><br/>
           Endereço: ${escape(p.endereco_entrega || "—")}<br/>
           Data: ${formatDate(p.data_entrega || "")}<br/>
           Horário: ${p.horario_entrega || "—"}`
        : `<strong>Retirada</strong><br/>
           Data: ${formatDate(p.data_retirada || "")}<br/>
           Horário: ${p.horario_retirada || "—"}`;

    const logisticaText =
      p.tipo_logistica === "entrega"
        ? `Entrega
  Endereço: ${p.endereco_entrega || "—"}
  Data: ${formatDate(p.data_entrega || "")}
  Horário: ${p.horario_entrega || "—"}`
        : `Retirada
  Data: ${formatDate(p.data_retirada || "")}
  Horário: ${p.horario_retirada || "—"}`;

    const itensHtml = p.itens.map(renderItem).join("");
    const itensText = p.itens.map(renderTextItem).join("\n\n");

    const detalhesUrl = p.id ? `${APP_BASE_URL}/admin/pedidos?id=${p.id}` : null;
    const linkHtml = detalhesUrl
      ? `<p style="margin:26px 0 0;"><a href="${detalhesUrl}" style="display:inline-block;background:#5a1f2b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;">Abrir pedido e fazer orçamento</a></p>`
      : "";

    const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#faf6f1;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
  <div style="max-width:620px;margin:0 auto;padding:28px 22px;">
    <h1 style="font-size:22px;color:#5a1f2b;margin:0 0 6px;">Novo pedido recebido 🍰</h1>
    <p style="margin:0 0 22px;color:#6b5a52;">Um cliente acabou de enviar um pedido pelo site.</p>

    <h2 style="font-size:15px;color:#5a1f2b;margin:18px 0 8px;text-transform:uppercase;letter-spacing:.5px;">Cliente</h2>
    <div style="padding:12px 14px;background:#fff;border:1px solid #eadfd5;border-radius:10px;">
      Nome: <strong>${escape(p.nome_cliente)}</strong><br/>
      Telefone: <strong>${escape(p.telefone)}</strong><br/>
      Endereço: ${escape(p.endereco)}
    </div>

    <h2 style="font-size:15px;color:#5a1f2b;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.5px;">Evento</h2>
    <div style="padding:12px 14px;background:#fff;border:1px solid #eadfd5;border-radius:10px;">
      Data: <strong>${formatDate(p.data_evento)}</strong><br/>
      Horário: <strong>${p.horario_evento}</strong>
    </div>

    <h2 style="font-size:15px;color:#5a1f2b;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.5px;">Logística</h2>
    <div style="padding:12px 14px;background:#fff;border:1px solid #eadfd5;border-radius:10px;">
      ${logisticaHtml}
    </div>

    <h2 style="font-size:15px;color:#5a1f2b;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.5px;">Pedido</h2>
    <ul style="list-style:none;padding:0;margin:0;">${itensHtml}</ul>

    ${linkHtml}
    <p style="margin:18px 0 0;color:#6b5a52;font-size:14px;">Acesse o sistema para criar o orçamento.</p>
  </div>
</body></html>`;

    const text = `Novo pedido recebido!

Cliente:
  Nome: ${p.nome_cliente}
  Telefone: ${p.telefone}
  Endereço: ${p.endereco}

Evento:
  Data: ${formatDate(p.data_evento)}
  Horário: ${p.horario_evento}

Logística:
  ${logisticaText}

Pedido:
${itensText}

${detalhesUrl ? `\n\nVer pedido completo: ${detalhesUrl}` : ""}

Acesse o sistema para criar o orçamento.`;

    // Build RFC 2822 MIME message (multipart/alternative for text + html)
    const subject = "Novo pedido recebido 🍰";
    const subjectEncoded = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const boundary = `b_${crypto.randomUUID().replace(/-/g, "")}`;
    const mime = [
      `To: ${TO_EMAIL}`,
      `Subject: ${subjectEncoded}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      btoa(unescape(encodeURIComponent(text))),
      `--${boundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      btoa(unescape(encodeURIComponent(html))),
      `--${boundary}--`,
    ].join("\r\n");

    const raw = btoa(unescape(encodeURIComponent(mime)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Gmail API error", res.status, data);
      throw new Error(`Gmail API failed [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-pedido-email failed:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
