import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

// Página de detalhe de uma vaga EB-3 + botão "Aplique aqui".
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const job = await prisma.eb3Job.findFirst({
    where: { id, published: true },
  });
  if (!job) notFound();

  const logo = job.logo ?? job.employer.slice(0, 2).toUpperCase();

  return (
    <div className="container">
      <div className="crumbs">
        <Link href="/vagas">Vagas EB-3</Link> <Icon n="chevron-right" /> <span>{job.title}</span>
      </div>

      <div className="jd__head">
        <div className="jd__logo">{logo}</div>
        <div style={{ flex: 1 }}>
          <h1>{job.title}</h1>
          <div className="jd__emp">
            <Icon n="building" /> {job.employer}{" "}
            <span className="visa-tag">
              <Icon n="license" /> {job.visa}
            </span>
          </div>
        </div>
        <Link className="btn btn--primary btn--lg" href={`/vagas/${job.id}/aplicar`}>
          <Icon n="send" /> Aplique aqui
        </Link>
      </div>

      <div className="jd__grid">
        <div>
          <div className="metagrid">
            <div className="metagrid__cell">
              <div className="kicker">Localização</div>
              <div className="val">
                <Icon n="map-pin" /> {job.location}
              </div>
            </div>
            <div className="metagrid__cell">
              <div className="kicker">Tipo</div>
              <div className="val">
                <Icon n="clock" /> {job.type}
              </div>
            </div>
            <div className="metagrid__cell">
              <div className="kicker">Salário base</div>
              <div className="val">
                <Icon n="cash" /> {job.salary}
              </div>
            </div>
            <div className="metagrid__cell">
              <div className="kicker">Vagas abertas</div>
              <div className="val">
                <Icon n="users" /> {job.openings} posições
              </div>
            </div>
          </div>

          <div className="jd__section">
            <h3>Sobre a vaga</h3>
            <p>{job.description}</p>
          </div>
          <div className="jd__section">
            <h3>Requisitos</h3>
            <ul className="blist">
              {job.requirements.map((r, i) => (
                <li key={i}>
                  <Icon n="circle-check" /> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="jd__section">
            <h3>Sobre o patrocínio EB-3</h3>
            <p>
              Esta posição oferece patrocínio do Green Card pela categoria EB-3. A Kick Start
              acompanha todas as etapas legais — DOL/PERM, I-140 e I-485/Consular — junto com você.
            </p>
          </div>
        </div>

        <aside className="jd__aside">
          <div className="card applycard">
            <div className="applycard__sal">
              {job.salary} <small>· salário base</small>
            </div>
            <hr />
            <div className="applycard__row">
              <span>Tipo de visto</span>
              <span>{job.visa}</span>
            </div>
            <div className="applycard__row">
              <span>Localização</span>
              <span>{job.location}</span>
            </div>
            <div className="applycard__row">
              <span>Vagas</span>
              <span>{job.openings}</span>
            </div>
            {job.postedLabel && (
              <div className="applycard__row">
                <span>Publicada</span>
                <span>{job.postedLabel}</span>
              </div>
            )}
            <Link
              className="btn btn--primary btn--block btn--lg"
              href={`/vagas/${job.id}/aplicar`}
              style={{ marginTop: 16 }}
            >
              <Icon n="send" /> Aplique aqui
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
