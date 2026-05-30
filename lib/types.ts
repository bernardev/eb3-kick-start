import type { CaseStatus } from "@prisma/client";

// Forma serializável de uma sub-etapa para a UI.
export type UiStep = {
  id: string;
  name: string;
  sub: string | null;
  status: CaseStatus;
};

// Forma serializável de uma fase do processo para a UI.
export type UiPhase = {
  id: string;
  key: string;
  icon: string;
  title: string;
  subtitle: string | null;
  notes: string;
  order: number;
  steps: UiStep[];
};
