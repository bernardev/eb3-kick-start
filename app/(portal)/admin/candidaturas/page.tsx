import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { createCase } from "@/lib/actions/cases";

export const dynamic = "force-dynamic";

function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

type AnswerItem = { label: string; answer: string };

// Lista de candidaturas recebidas (todas as aplicações às vagas EB-3).
export default async function CandidaturasPage() {
  await requireAdmin();

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true, employer: true, visa: true } },
      user: { select: { id: true, name: true, email: true, country: true, case: { select: { id: true } } } },
    },
  });

  return (
    <div className="container container--wide">
      <div className="pagehead">
        <div>
          <div className="kicker">Painel da equipe</div>
          <h1>Candidaturas recebidas</h1>
          <p>Respostas enviadas pelos clientes no fluxo &quot;Aplique aqui&quot;.</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="send" />
            </div>
            <h3>Nenhuma candidatura ainda</h3>
            <p>Quando um cliente aplicar a uma vaga, as respostas aparecem aqui.</p>
          </div>
        </div>
      ) : (
        applications.map((app) => {
          const answers = (app.answers as unknown as AnswerItem[]) ?? [];
          const hasCase = !!app.user.case;
          return (
            <div className="card formcard" key={app.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ marginBottom: 6 }}>
                    {app.job.title} · {app.job.employer}
                  </h3>
                  <div className="casemeta" style={{ marginTop: 0 }}>
                    <span>
                      <Icon n="user" /> <b>{app.user.name ?? "Cliente"}</b> · {app.user.email}
                    </span>
                    {app.user.country && (
                      <span>
                        <Icon n="flag" /> {app.user.country}
                      </span>
                    )}
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
                </div>
                {hasCase ? (
                  <Link className="btn btn--ghost btn--sm" href={`/admin/casos/${app.user.case!.id}`}>
                    <Icon n="arrow-right" /> Ver caso
                  </Link>
                ) : (
                  <form action={createCase}>
                    <input type="hidden" name="userId" value={app.user.id} />
                    <input type="hidden" name="jobLabel" value={`${app.job.title} · ${app.job.employer}`} />
                    <input type="hidden" name="country" value={app.user.country ?? ""} />
                    <button className="btn btn--primary btn--sm" type="submit">
                      <Icon n="plus" /> Abrir caso
                    </button>
                  </form>
                )}
              </div>

              <div style={{ marginTop: 14 }}>
                {answers.map((a, i) => (
                  <div className="answer" key={i}>
                    <div className="answer__q">{a.label}</div>
                    <div className="answer__a">{a.answer || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
