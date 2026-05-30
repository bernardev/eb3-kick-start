import type { CaseStatus } from "@prisma/client";

// Chave de status usada no CSS/UI (semântica de cores fixa).
export type StatusKey = "approved" | "analysis" | "pending" | "denied" | "none";

// Mapeia o enum do banco para a chave de UI e vice-versa.
export const STATUS_KEY: Record<CaseStatus, StatusKey> = {
  APPROVED: "approved",
  ANALYSIS: "analysis",
  PENDING: "pending",
  DENIED: "denied",
  NONE: "none",
};

export const STATUS_ENUM: Record<StatusKey, CaseStatus> = {
  approved: "APPROVED",
  analysis: "ANALYSIS",
  pending: "PENDING",
  denied: "DENIED",
  none: "NONE",
};

// Configuração visual de cada status (rótulo + ícone Tabler).
export const STATUS: Record<StatusKey, { label: string; icon: string }> = {
  approved: { label: "Aprovado", icon: "circle-check" },
  analysis: { label: "Em análise", icon: "loader-2" },
  pending: { label: "Pendência", icon: "alert-triangle" },
  denied: { label: "Negado", icon: "circle-x" },
  none: { label: "Não iniciado", icon: "circle" },
};

// Opções do <select> de status no admin (ordem do design).
export const STATUS_OPTIONS: { value: CaseStatus; label: string }[] = [
  { value: "NONE", label: "Não iniciado" },
  { value: "ANALYSIS", label: "Em análise" },
  { value: "PENDING", label: "Pendência" },
  { value: "DENIED", label: "Negado" },
  { value: "APPROVED", label: "Aprovado" },
];

// Deriva o status de uma fase a partir dos status das suas sub-etapas
// (mesma regra do protótipo aprovado).
export function derivePhaseStatus(steps: { status: CaseStatus }[]): StatusKey {
  const v = steps.map((s) => STATUS_KEY[s.status]);
  if (v.some((s) => s === "denied")) return "denied";
  if (v.length > 0 && v.every((s) => s === "none")) return "none";
  if (v.length > 0 && v.every((s) => s === "approved")) return "approved";
  if (v.some((s) => s === "analysis")) return "analysis";
  if (v.some((s) => s === "pending")) return "pending";
  return "analysis"; // mistura de aprovado + não iniciado = em andamento
}

// Resumo de um caso para a listagem do admin: status geral + fase atual.
export function deriveCaseSummary(
  phases: { title: string; steps: { status: CaseStatus }[] }[],
): { status: StatusKey; phaseTitle: string } {
  const derived = phases.map((p) => ({ title: p.title, status: derivePhaseStatus(p.steps) }));
  if (derived.length === 0) return { status: "none", phaseTitle: "—" };

  const denied = derived.find((d) => d.status === "denied");
  if (denied) return { status: "denied", phaseTitle: denied.title };

  if (derived.every((d) => d.status === "approved")) {
    return { status: "approved", phaseTitle: derived[derived.length - 1].title };
  }
  // primeira fase ainda não aprovada = fase atual
  const current = derived.find((d) => d.status !== "approved") ?? derived[derived.length - 1];
  return { status: current.status, phaseTitle: current.title };
}

// As 4 fases na timeline (rótulos curtos).
export const PHASE_NODES = [
  { key: "sel", label: "Seleção" },
  { key: "dol", label: "DOL / PERM" },
  { key: "i140", label: "I-140" },
  { key: "i485", label: "I-485 / Consular" },
];
