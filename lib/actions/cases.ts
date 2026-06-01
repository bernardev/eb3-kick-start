"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { STATUS_ENUM, type StatusKey } from "@/lib/status";
import { STANDARD_PHASES } from "@/lib/phases";

const statusKeys = ["approved", "analysis", "pending", "denied", "none"] as const;

// Gera um número de caso sequencial no formato KS-AAAA-####.
async function nextCaseNo() {
  const year = new Date().getFullYear();
  const n = (await prisma.case.count()) + 1;
  let caseNo = `KS-${year}-${String(n).padStart(4, "0")}`;
  // Garante unicidade caso já exista (ex.: importação manual).
  while (await prisma.case.findUnique({ where: { caseNo } })) {
    caseNo = `KS-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  }
  return caseNo;
}

// Abre um novo caso para um cliente, criando as 4 fases padrão (todas
// "não iniciado"). Usado pelo botão "Abrir caso" (candidaturas) e pelo
// formulário "Novo caso". Em sucesso, vai direto para o editor do caso.
export async function createCase(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/admin");

  const existing = await prisma.case.findUnique({ where: { userId } });
  if (existing) redirect(`/admin/casos/${existing.id}`); // já tem caso

  const manager = String(formData.get("manager") ?? "").trim();
  const jobLabel = String(formData.get("jobLabel") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || user.country || null;
  const caseNoInput = String(formData.get("caseNo") ?? "").trim();
  const caseNo = caseNoInput || (await nextCaseNo());

  const created = await prisma.case.create({
    data: {
      userId,
      caseNo,
      country,
      manager: manager ? `${manager} · Kick Start Team` : "Kick Start Team",
      jobLabel: jobLabel || null,
      phases: {
        create: STANDARD_PHASES.map((p, i) => ({
          key: p.key,
          order: i,
          icon: p.icon,
          title: p.title,
          subtitle: p.subtitle,
          notes: "",
          steps: {
            create: p.steps.map((s, j) => ({ order: j, name: s.name, sub: s.sub, status: "NONE" })),
          },
        })),
      },
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/casos/${created.id}`);
}

// Atualiza o status de uma sub-etapa (somente equipe/admin).
export async function updateStepStatus(stepId: string, statusKey: StatusKey) {
  await requireAdmin();
  const key = z.enum(statusKeys).parse(statusKey);

  const step = await prisma.caseStep.update({
    where: { id: stepId },
    data: { status: STATUS_ENUM[key] },
    select: { phase: { select: { caseId: true } } },
  });

  // Marca o caso como atualizado (reflete no "última atualização").
  await prisma.case.update({
    where: { id: step.phase.caseId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/admin/casos/${step.phase.caseId}`);
  revalidatePath("/meu-processo");
  revalidatePath("/admin");
}

// Salva as "Notas da equipe" de uma fase (somente equipe/admin).
export async function updatePhaseNotes(phaseId: string, notes: string) {
  await requireAdmin();
  const text = z.string().max(5000).parse(notes);

  const phase = await prisma.casePhase.update({
    where: { id: phaseId },
    data: { notes: text },
    select: { caseId: true },
  });

  await prisma.case.update({
    where: { id: phase.caseId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/admin/casos/${phase.caseId}`);
  revalidatePath("/meu-processo");
}
