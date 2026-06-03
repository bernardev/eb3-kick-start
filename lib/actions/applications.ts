"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { sendApplicationEmail, sendG1Email } from "@/lib/email";
import { CONSENT_CHECKBOX } from "@/lib/consent";
import { renderG1Pdf } from "@/lib/g1-pdf";
import { MARITAL_OPTIONS, EDUCATION_OPTIONS, type G1Data } from "@/lib/g1";

export type ApplyState = { ok?: boolean; error?: string };

// Recebe e processa uma aplicação a uma vaga EB-3:
//  1) valida consentimento + respostas obrigatórias;
//  2) salva no banco (com prova de aceite: texto, data/hora e IP);
//  3) dispara e-mail para a equipe (info@kick-start.us).
export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const user = await requireUser();

  const jobId = String(formData.get("jobId") ?? "");
  const job = await prisma.eb3Job.findFirst({
    where: { id: jobId, published: true },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!job) return { error: "Vaga não encontrada ou indisponível." };

  // O consentimento é obrigatório.
  if (formData.get("consent") !== "on") {
    return { error: "É necessário marcar o consentimento para enviar a aplicação." };
  }

  // Monta as respostas e valida as obrigatórias.
  const answers: { questionId: string; label: string; answer: string }[] = [];
  for (const q of job.questions) {
    const value = String(formData.get(`q_${q.id}`) ?? "").trim();
    if (q.required && !value) {
      return { error: `Responda: "${q.label}".` };
    }
    answers.push({ questionId: q.id, label: q.label, answer: value });
  }

  // IP de origem (prova adicional do aceite).
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    null;

  const now = new Date();

  // Dados completos do usuário (país etc.).
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobId: job.id,
      answers,
      consentAccepted: true,
      consentText: CONSENT_CHECKBOX,
      consentAt: now,
      consentIp: ip,
    },
  });

  // Envia o e-mail para a equipe. Se falhar, a aplicação já está salva e
  // aparece no painel admin — apenas registramos o erro no log do servidor.
  try {
    await sendApplicationEmail({
      jobTitle: job.title,
      jobEmployer: job.employer,
      jobLocation: job.location,
      jobVisa: job.visa,
      applicantName: dbUser?.name ?? user.name ?? "—",
      applicantEmail: dbUser?.email ?? user.email ?? "—",
      applicantCountry: dbUser?.country,
      applicantId: user.id,
      applicationId: application.id,
      submittedAt: now,
      consentText: CONSENT_CHECKBOX,
      consentIp: ip,
      answers: answers.map((a) => ({ label: a.label, answer: a.answer })),
    });
    await prisma.application.update({
      where: { id: application.id },
      data: { emailSentAt: new Date() },
    });
  } catch (err) {
    console.error("[EB-3] Falha ao enviar e-mail da aplicação:", err);
  }

  return { ok: true };
}

export type G1SubmitState = { ok?: boolean; error?: string };

// Recebe a aplicação via Formulário G1: valida consentimento + declaração,
// salva o G1 (JSON) no banco com prova de aceite, gera o PDF preenchido e
// envia para a equipe (info@kick-start.us) com o PDF em anexo.
export async function submitG1(input: {
  jobId: string;
  data: G1Data;
  consent: boolean;
}): Promise<G1SubmitState> {
  const user = await requireUser();

  const job = await prisma.eb3Job.findFirst({ where: { id: input.jobId, published: true } });
  if (!job) return { error: "Vaga não encontrada ou indisponível." };

  if (!input.data?.declaration?.agreed) {
    return { error: "É preciso aceitar a Declaração para enviar." };
  }
  if (!input.consent) {
    return { error: "É necessário marcar o consentimento para enviar a aplicação." };
  }

  const d = input.data;
  // Validação mínima dos campos essenciais.
  if (!d.personal.firstName.trim() || !d.personal.lastName.trim()) {
    return { error: "Preencha ao menos Nome e Sobrenome." };
  }
  if (!d.additional.email.trim()) {
    return { error: "Preencha o e-mail (seção Informações Adicionais)." };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || null;
  const now = new Date();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const applicantName =
    `${d.personal.firstName} ${d.personal.lastName}`.trim() || dbUser?.name || "—";

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobId: job.id,
      answers: d as unknown as object, // G1 completo em JSON
      consentAccepted: true,
      consentText: CONSENT_CHECKBOX,
      consentAt: now,
      consentIp: ip,
    },
  });

  // Gera PDF + envia e-mail com anexo. Se falhar, a aplicação já está salva.
  // IMPORTANTE: o documento enviado à equipe/empresas é SEMPRE em inglês.
  try {
    const pdf = await renderG1Pdf(d, {
      jobTitle: job.title,
      jobEmployer: job.employer,
      jobVisa: job.visa,
      applicantName,
      applicantEmail: d.additional.email || dbUser?.email || "—",
      submittedAt: now,
      lang: "en",
    });

    const enOpt = (options: typeof MARITAL_OPTIONS, value: string) =>
      options.find((o) => o.value === value)?.en ?? "—";
    const summary = [
      { label: "Name", value: applicantName },
      { label: "Date of birth", value: d.address.dob },
      { label: "Email", value: d.additional.email },
      { label: "Phone", value: d.address.phone },
      { label: "Marital status", value: enOpt(MARITAL_OPTIONS, d.personal.maritalStatus) },
      { label: "Education", value: enOpt(EDUCATION_OPTIONS, d.education.level) },
      { label: "Current employer", value: `${d.currentEmployment.employer} ${d.currentEmployment.jobTitle}`.trim() },
      { label: "Citizenship", value: d.address.citizenship },
    ];

    await sendG1Email({
      jobTitle: job.title,
      jobEmployer: job.employer,
      jobVisa: job.visa,
      applicantName,
      applicantEmail: d.additional.email || dbUser?.email || "—",
      applicantId: user.id,
      applicationId: application.id,
      submittedAt: now,
      consentText: CONSENT_CHECKBOX,
      consentIp: ip,
      summary,
      pdf,
      pdfFilename: `G1-${applicantName.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`,
    });

    await prisma.application.update({ where: { id: application.id }, data: { emailSentAt: new Date() } });
  } catch (err) {
    console.error("[EB-3] Falha ao gerar/enviar e-mail do G1:", err);
  }

  return { ok: true };
}
