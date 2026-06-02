import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { ProcessView } from "@/components/ProcessView";
import { AnswersBlock } from "@/components/AnswersBlock";
import type { UiPhase } from "@/lib/types";

export const dynamic = "force-dynamic";

function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

// Editor de caso (equipe): status das fases/sub-etapas + notas + respostas.
export default async function CaseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const eb3case = await prisma.case.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      phases: {
        orderBy: { order: "asc" },
        include: { steps: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!eb3case) notFound();

  const applications = await prisma.application.findMany({
    where: { userId: eb3case.userId },
    orderBy: { createdAt: "desc" },
    include: { job: { select: { title: true, employer: true } } },
  });

  const phases: UiPhase[] = eb3case.phases.map((p) => ({
    id: p.id,
    key: p.key,
    icon: p.icon,
    title: p.title,
    subtitle: p.subtitle,
    notes: p.notes,
    order: p.order,
    steps: p.steps.map((s) => ({ id: s.id, name: s.name, sub: s.sub, status: s.status })),
  }));

  const initialOpen = phases.slice(0, 2).map((p) => p.id);

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/admin">Casos</Link> <Icon n="chevron-right" /> <span>{eb3case.user.name}</span>
      </div>

      <div className="admin-banner">
        <Icon n="pencil" /> Modo de edição — alterações de status e notas ficam visíveis para o
        cliente.
      </div>

      <div className="casehead">
        <div>
          <h1>
            {eb3case.user.name}{" "}
            <span className="case-chip">
              <Icon n="hash" /> {eb3case.caseNo}
            </span>
          </h1>
          <div className="casemeta">
            {eb3case.jobLabel && (
              <span>
                <Icon n="briefcase" /> Vaga: <b>{eb3case.jobLabel}</b>
              </span>
            )}
            {eb3case.country && (
              <span>
                <Icon n="flag" /> Origem: <b>{eb3case.country}</b>
              </span>
            )}
            {eb3case.manager && (
              <span>
                <Icon n="user-shield" /> Manager: <b>{eb3case.manager}</b>
              </span>
            )}
            <span>
              <Icon n="mail" /> <b>{eb3case.user.email}</b>
            </span>
          </div>
        </div>
      </div>

      <ProcessView phases={phases} editable initialOpen={initialOpen} />

      {/* Aplicações enviadas por este cliente */}
      <div className="kicker" style={{ margin: "30px 0 12px" }}>
        Aplicações enviadas ({applications.length})
      </div>
      {applications.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="send" />
            </div>
            <h3>Nenhuma aplicação ainda</h3>
            <p>Quando o cliente aplicar a uma vaga, as respostas aparecem aqui.</p>
          </div>
        </div>
      ) : (
        applications.map((app) => {
          return (
            <div className="card formcard" key={app.id}>
              <h3>
                {app.job.title} · {app.job.employer}
              </h3>
              <div className="casemeta" style={{ marginTop: 0, marginBottom: 14 }}>
                <span>
                  <Icon n="calendar-event" /> {fmtDateTime(app.createdAt)}
                </span>
                <span>
                  <Icon n="discount-check" /> Consentimento: <b>aceito</b>
                  {app.consentIp ? ` · IP ${app.consentIp}` : ""}
                </span>
                <span>
                  <Icon n={app.emailSentAt ? "mail-check" : "mail-x"} /> E-mail:{" "}
                  <b>{app.emailSentAt ? "enviado" : "não enviado"}</b>
                </span>
              </div>
              <AnswersBlock appId={app.id} answers={app.answers} />
            </div>
          );
        })
      )}
    </div>
  );
}
