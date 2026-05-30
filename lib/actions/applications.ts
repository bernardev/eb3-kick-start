"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { sendApplicationEmail } from "@/lib/email";
import { CONSENT_CHECKBOX } from "@/lib/consent";

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
