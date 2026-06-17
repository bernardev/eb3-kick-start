import { prisma } from "@/lib/db";

// Regra de trava da edição da aplicação G1.
// "Status alterado" = o caso do usuário já teve ALGUMA etapa movida de
// "Não iniciado" (CaseStatus.NONE) para qualquer outro status pela equipe.
// Enquanto todas as etapas estiverem em NONE, o candidato AINDA pode editar
// sua aplicação — mesmo que o caso já exista (a equipe abre o caso cedo só
// para exibir o "Meu Processo", sem ter mexido em nenhum status).
export async function caseStatusChanged(userId: string): Promise<boolean> {
  const step = await prisma.caseStep.findFirst({
    where: { status: { not: "NONE" }, phase: { case: { userId } } },
    select: { id: true },
  });
  return !!step;
}
