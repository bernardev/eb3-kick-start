"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { STATUS_ENUM, type StatusKey } from "@/lib/status";

const statusKeys = ["approved", "analysis", "pending", "denied", "none"] as const;

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
