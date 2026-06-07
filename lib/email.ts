import { Resend } from "resend";
import nodemailer from "nodemailer";

// Envia um e-mail usando SMTP (ex.: Gmail/Google Workspace, HostGator) se
// SMTP_HOST estiver definido; senão usa o Resend. Lança erro se nenhum estiver
// configurado ou se o envio falhar.
type Mail = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer }[];
};

// Resultado do envio (para rastreio).
export type DeliverResult = { via: "smtp" | "resend"; id: string; accepted?: string[]; response?: string };

async function deliver(msg: Mail): Promise<DeliverResult> {
  const host = process.env.SMTP_HOST;
  if (host) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = SSL; 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const info = await transporter.sendMail({
      from: msg.from,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      attachments: msg.attachments,
    });
    return {
      via: "smtp",
      id: info.messageId ?? "",
      accepted: (info.accepted ?? []).map(String),
      response: info.response,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: msg.from,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject,
      html: msg.html,
      text: msg.text ?? "",
      attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    if (error) throw new Error(`Falha ao enviar e-mail (Resend): ${error.message}`);
    return { via: "resend", id: data?.id ?? "" };
  }

  throw new Error(
    "E-mail não configurado: defina SMTP_HOST (+SMTP_USER/SMTP_PASS) ou RESEND_API_KEY, e MAIL_FROM.",
  );
}

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

// ---- E-mail da aplicação G1 (com PDF do formulário em anexo) ----
export type G1EmailData = {
  jobTitle: string;
  jobEmployer: string;
  jobVisa: string;
  applicantName: string;
  applicantEmail: string;
  applicantId: string;
  applicationId: string;
  submittedAt: Date;
  consentText: string;
  consentIp?: string | null;
  summary: { label: string; value: string }[]; // resumo de campos-chave
  pdf: Buffer;
  pdfFilename: string;
};

// O e-mail para a equipe/empresas é SEMPRE em inglês (ele é encaminhado às
// empresas sponsors), independente do idioma usado pelo candidato no site.
function buildG1Html(d: G1EmailData) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo",
  }).format(d.submittedAt);

  const rows = d.summary
    .map(
      (a) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e7e9f0;color:#8a92a4;font-size:13px;font-weight:600;width:42%;vertical-align:top">${esc(a.label)}</td>
        <td style="padding:8px 0 8px 14px;border-bottom:1px solid #e7e9f0;color:#181b24;font-size:14px">${esc(a.value || "—")}</td>
      </tr>`,
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#181b24">
    <div style="background:${BRAND};color:#fff;padding:22px 26px;border-radius:12px 12px 0 0">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">EB-3 Portal · Kick Start · G1 Form</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">New application (G1 Form)</div>
    </div>
    <div style="border:1px solid #e7e9f0;border-top:none;border-radius:0 0 12px 12px;padding:26px">
      <h2 style="font-size:16px;margin:0 0 10px">Job</h2>
      <p style="margin:0 0 4px;font-size:15px;font-weight:700">${esc(d.jobTitle)}</p>
      <p style="margin:0 0 18px;color:#545c6e;font-size:14px">${esc(d.jobEmployer)} · ${esc(d.jobVisa)}</p>

      <h2 style="font-size:16px;margin:18px 0 10px">Applicant</h2>
      <p style="margin:0 0 4px;font-size:15px;font-weight:700">${esc(d.applicantName)}</p>
      <p style="margin:0;color:#545c6e;font-size:14px">${esc(d.applicantEmail)}</p>
      <p style="margin:6px 0 0;color:#8a92a4;font-size:12px">Client ID: ${esc(d.applicantId)} · Application ID: ${esc(d.applicationId)}</p>

      <div style="margin-top:18px;background:#fcf3d7;border:1px solid #ecd384;border-radius:10px;padding:12px 14px;font-size:13px;color:#545c6e">
        📎 The complete G1 form is in the <b>attached PDF</b> (${esc(d.pdfFilename)}).
      </div>

      <h2 style="font-size:16px;margin:22px 0 6px">Summary</h2>
      <table style="width:100%;border-collapse:collapse">${rows}</table>

      <div style="margin-top:24px;background:#e7f5ec;border:1px solid #b3ddc3;border-radius:10px;padding:14px 16px">
        <div style="font-size:13px;font-weight:700;color:#1f9254;margin-bottom:6px">Consent recorded</div>
        <div style="font-size:13px;color:#545c6e;line-height:1.5">"${esc(d.consentText)}"</div>
        <div style="font-size:12px;color:#8a92a4;margin-top:8px">Accepted on ${fmt}${d.consentIp ? ` · IP ${esc(d.consentIp)}` : ""}</div>
      </div>
    </div>
  </div>`;
}

/**
 * Envia o e-mail da aplicação G1 (resumo no corpo + PDF completo em anexo)
 * para a caixa da equipe (MAIL_TO). Lança erro se o Resend não estiver
 * configurado ou se a API falhar.
 */
export async function sendG1Email(d: G1EmailData): Promise<DeliverResult & { to: string }> {
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO ?? "info@kick-start.us";
  if (!from) throw new Error("E-mail não configurado: defina MAIL_FROM no ambiente.");

  const result = await deliver({
    from,
    to,
    replyTo: d.applicantEmail,
    subject: `New G1 application — ${d.jobTitle} — ${d.applicantName}`,
    html: buildG1Html(d),
    text: `New G1 application — ${d.jobTitle} — ${d.applicantName}. The complete G1 form is attached as a PDF.`,
    attachments: [{ filename: d.pdfFilename, content: d.pdf }],
  });
  return { ...result, to };
}

// ---- E-mails de redefinição de senha (bilíngues) ----
function resetButton(label: string, link: string) {
  return `<a href="${esc(link)}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:15px;padding:13px 22px;border-radius:9px">${esc(label)}</a>`;
}
function shell(inner: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#181b24">
    <div style="background:${BRAND};color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;font-size:16px;font-weight:700">Kick Start · Portal EB-3</div>
    <div style="border:1px solid #e7e9f0;border-top:none;border-radius:0 0 12px 12px;padding:24px;font-size:14px;line-height:1.6;color:#374151">${inner}</div>
  </div>`;
}

// Envia o link de redefinição de senha (idioma pt/en).
export async function sendPasswordResetEmail(to: string, link: string, locale: "pt" | "en") {
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("Defina MAIL_FROM no ambiente.");
  const pt = locale !== "en";
  const subject = pt ? "Redefinição de senha — Kick Start EB-3" : "Password reset — Kick Start EB-3";
  const body = pt
    ? `<p>Recebemos um pedido para redefinir a sua senha.</p>
       <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <b>1 hora</b>.</p>
       <p style="margin:22px 0">${resetButton("Redefinir senha", link)}</p>
       <p style="color:#8a92a4;font-size:12px">Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</p>`
    : `<p>We received a request to reset your password.</p>
       <p>Click the button below to create a new password. The link is valid for <b>1 hour</b>.</p>
       <p style="margin:22px 0">${resetButton("Reset password", link)}</p>
       <p style="color:#8a92a4;font-size:12px">If you didn't request this, you can ignore this email — your password stays the same.</p>`;
  await deliver({ from, to, subject, html: shell(body), text: `${subject}: ${link}` });
}

// Avisa que a conta usa login com Google (não tem senha pra redefinir).
export async function sendGoogleAccountNoticeEmail(to: string, loginUrl: string, locale: "pt" | "en") {
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("Defina MAIL_FROM no ambiente.");
  const pt = locale !== "en";
  const subject = pt ? "Acesso à sua conta — Kick Start EB-3" : "Accessing your account — Kick Start EB-3";
  const body = pt
    ? `<p>Você pediu para redefinir a senha, mas a sua conta entra com <b>"Continuar com Google"</b> — por isso não há senha para redefinir.</p>
       <p style="margin:22px 0">${resetButton("Ir para o login", loginUrl)}</p>
       <p style="color:#8a92a4;font-size:12px">Na tela de login, use o botão "Continuar com Google".</p>`
    : `<p>You requested a password reset, but your account signs in with <b>"Continue with Google"</b> — so there's no password to reset.</p>
       <p style="margin:22px 0">${resetButton("Go to login", loginUrl)}</p>
       <p style="color:#8a92a4;font-size:12px">On the login screen, use "Continue with Google".</p>`;
  await deliver({ from, to, subject, html: shell(body), text: `${subject}: ${loginUrl}` });
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
