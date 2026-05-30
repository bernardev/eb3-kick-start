import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

// Lista de vagas EB-3 para a equipe gerenciar.
export default async function AdminVagasPage() {
  await requireAdmin();

  const jobs = await prisma.eb3Job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true, questions: true } } },
  });

  return (
    <div className="container container--wide">
      <div className="pagehead">
        <div>
          <div className="kicker">Painel da equipe</div>
          <h1>Vagas EB-3</h1>
          <p>Cadastre e edite as vagas e os questionários de cada posição.</p>
        </div>
        <Link className="btn btn--primary" href="/admin/vagas/nova">
          <Icon n="plus" /> Nova vaga
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="briefcase-off" />
            </div>
            <h3>Nenhuma vaga cadastrada</h3>
            <p>Crie a primeira vaga EB-3 para que os clientes possam se candidatar.</p>
            <Link className="btn btn--ghost" href="/admin/vagas/nova">
              <Icon n="plus" /> Nova vaga
            </Link>
          </div>
        </div>
      ) : (
        <div className="tablewrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Local</th>
                <th>Visto</th>
                <th>Perguntas</th>
                <th>Aplicações</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <Link href={`/admin/vagas/${j.id}`} style={{ textDecoration: "none" }}>
                      <div className="tbl__title">{j.title}</div>
                      <div className="tbl__sub">{j.employer}</div>
                    </Link>
                  </td>
                  <td>{j.location}</td>
                  <td>
                    <span className="visa-tag">
                      <Icon n="license" /> {j.visa}
                    </span>
                  </td>
                  <td>{j._count.questions}</td>
                  <td>{j._count.applications}</td>
                  <td>
                    {j.published ? (
                      <span className="badge badge--approved">
                        <span className="ico-dot" /> Publicada
                      </span>
                    ) : (
                      <span className="badge badge--none">
                        <span className="ico-dot" /> Rascunho
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link className="editlink" href={`/admin/vagas/${j.id}`}>
                      Editar <Icon n="arrow-right" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
