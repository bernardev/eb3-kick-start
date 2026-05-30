import { Resend } from "resend";

// Dados necessários para montar o e-mail de uma aplicação EB-3.
export type ApplicationEmailData = {
  jobTitle: string;
  jobEmployer: string;
  jobLocation: string;
  jobVisa: string;
  applicantName: string;
  applicantEmail: string;
  applicantCountry?: string | null;
  applicantId: string;
  applicationId: string;
  submittedAt: Date;
  consentText: string;
  consentIp?: string | null;
  answers: { label: string; answer: string }[];
};

const BRAND = "#730027";

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Monta o corpo HTML do e-mail: identifica claramente a vaga e o cliente,
// lista todas as respostas e registra o aceite (consentimento).
function buildHtml(d: ApplicationEmailData) {
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d.submittedAt);

  const answersRows = d.answers
    .map(
      (a) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e7e9f0;color:#8a92a4;font-size:13px;font-weight:600;width:42%;vertical-align:top">${esc(
          a.label,
        )}</td>
        <td style="padding:10px 0 10px 14px;border-bottom:1px solid #e7e9f0;color:#181b24;font-size:14px;white-space:pre-wrap">${esc(
          a.answer || "—",
        )}</td>
      </tr>`,
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#181b24">
    <div style="background:${BRAND};color:#fff;padding:22px 26px;border-radius:12px 12px 0 0">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">Portal EB-3 · Kick Start</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">Nova aplicação recebida</div>
    </div>
    <div style="border:1px solid #e7e9f0;border-top:none;border-radius:0 0 12px 12px;padding:26px">

      <h2 style="font-size:16px;margin:0 0 10px">Vaga</h2>
      <p style="margin:0 0 4px;font-size:15px;font-weight:700">${esc(d.jobTitle)}</p>
      <p style="margin:0 0 18px;color:#545c6e;font-size:14px">
        ${esc(d.jobEmployer)} · ${esc(d.jobLocation)} · ${esc(d.jobVisa)}
      </p>

      <h2 style="font-size:16px;margin:18px 0 10px">Cliente</h2>
      <p style="margin:0 0 4px;font-size:15px;font-weight:700">${esc(d.applicantName)}</p>
      <p style="margin:0;color:#545c6e;font-size:14px">${esc(d.applicantEmail)}</p>
      ${
        d.applicantCountry
          ? `<p style="margin:2px 0 0;color:#545c6e;font-size:14px">Origem: ${esc(d.applicantCountry)}</p>`
          : ""
      }
      <p style="margin:6px 0 0;color:#8a92a4;font-size:12px">ID do cliente: ${esc(
        d.applicantId,
      )} · ID da aplicação: ${esc(d.applicationId)}</p>

      <h2 style="font-size:16px;margin:24px 0 6px">Respostas do questionário</h2>
      <table style="width:100%;border-collapse:collapse">${answersRows}</table>

      <div style="margin-top:24px;background:#e7f5ec;border:1px solid #b3ddc3;border-radius:10px;padding:14px 16px">
        <div style="font-size:13px;font-weight:700;color:#1f9254;margin-bottom:6px">Consentimento registrado</div>
        <div style="font-size:13px;color:#545c6e;line-height:1.5">"${esc(d.consentText)}"</div>
        <div style="font-size:12px;color:#8a92a4;margin-top:8px">
          Aceite em ${fmt}${d.consentIp ? ` · IP ${esc(d.consentIp)}` : ""}
        </div>
      </div>
    </div>
  </div>`;
}

// Versão texto puro (fallback de clientes que não renderizam HTML).
function buildText(d: ApplicationEmailData) {
  const lines = [
    "NOVA APLICAÇÃO EB-3 — Kick Start",
    "",
    `Vaga: ${d.jobTitle}`,
    `Empregador: ${d.jobEmployer} · ${d.jobLocation} · ${d.jobVisa}`,
    "",
    `Cliente: ${d.applicantName} <${d.applicantEmail}>`,
    d.applicantCountry ? `Origem: ${d.applicantCountry}` : "",
    `ID cliente: ${d.applicantId} · ID aplicação: ${d.applicationId}`,
    "",
    "RESPOSTAS:",
    ...d.answers.map((a) => `- ${a.label}: ${a.answer || "—"}`),
    "",
    `Consentimento: "${d.consentText}"`,
    `Aceite em ${d.submittedAt.toISOString()}${d.consentIp ? ` · IP ${d.consentIp}` : ""}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * Envia o e-mail da aplicação para a caixa da equipe (MAIL_TO).
 * Lança erro se o Resend não estiver configurado ou se a API falhar —
 * o chamador decide como tratar (a aplicação já foi salva no banco).
 */
export async function sendApplicationEmail(d: ApplicationEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO ?? "info@kick-start.us";

  if (!apiKey || !from) {
    throw new Error(
      "E-mail não configurado: defina RESEND_API_KEY e MAIL_FROM no ambiente.",
    );
  }

  const resend = new Resend(apiKey);
  const subject = `Nova aplicação EB-3 — ${d.jobTitle} — ${d.applicantName}`;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: d.applicantEmail,
    subject,
    html: buildHtml(d),
    text: buildText(d),
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail (Resend): ${error.message}`);
  }
}
