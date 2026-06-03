/* ============================================================
   Teste rápido de envio de e-mail (SMTP).
   Lê SMTP_* / MAIL_* do .env e manda um e-mail de teste para MAIL_TO.
   Uso: npm run email:test
   ============================================================ */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

// Carrega o .env (nodemailer não faz isso sozinho).
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* sem .env — usa o ambiente atual */
}

async function main() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO ?? "info@kick-start.us";

  if (!host || !user || !pass || !from) {
    console.error("✗ Faltam variáveis. Defina no .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO.");
    process.exit(1);
  }

  console.log(`→ Conectando em ${host}:${port} como ${user}…`);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.verify();
  console.log("✓ Conexão/autenticação OK.");

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Teste de e-mail — Kick Start EB-3",
    text: "Funcionou! Este é um e-mail de teste do Portal EB-3. Se você recebeu isto, o envio das aplicações está OK.",
  });

  console.log(`✓ E-mail enviado para ${to}. messageId: ${info.messageId}`);
  console.log("  Confira a caixa de entrada (e o spam).");
}

main().catch((e) => {
  console.error("✗ Falha:", e.message);
  process.exit(1);
});
