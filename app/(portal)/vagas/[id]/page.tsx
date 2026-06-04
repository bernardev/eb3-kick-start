import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { SupportCta } from "@/components/SupportCta";

export const dynamic = "force-dynamic";

// Página de detalhe de uma vaga EB-3 + botão "Aplique aqui".
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const t = await getTranslations("jobDetail");

  const job = await prisma.eb3Job.findFirst({
    where: { id, published: true },
  });
  if (!job) notFound();

  const logo = job.logo ?? job.employer.slice(0, 2).toUpperCase();

  return (
    <div className="container">
      <div className="crumbs">
        <Link href="/vagas">{t("breadcrumb")}</Link> <Icon n="chevron-right" /> <span>{job.title}</span>
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
          <Icon n="send" /> {t("applyHere")}
        </Link>
      </div>

      <div className="jd__grid">
        <div>
          <div className="metagrid">
            <div className="metagrid__cell">
              <div className="kicker">{t("location")}</div>
              <div className="val">
                <Icon n="map-pin" /> {job.location}
              </div>
            </div>
            <div className="metagrid__cell">
              <div className="kicker">{t("type")}</div>
              <div className="val">
                <Icon n="clock" /> {job.type}
              </div>
            </div>
            <div className="metagrid__cell">
              <div className="kicker">{t("baseSalary")}</div>
              <div className="val">
                <Icon n="cash" /> {job.salary}
              </div>
            </div>
            <div className="metagrid__cell">
              <div className="kicker">{t("openings")}</div>
              <div className="val">
                <Icon n="users" /> {t("positions", { count: job.openings })}
              </div>
            </div>
          </div>

          <div className="jd__section">
            <h3>{t("about")}</h3>
            <p>{job.description}</p>
          </div>
          <div className="jd__section">
            <h3>{t("requirements")}</h3>
            <ul className="blist">
              {job.requirements.map((r, i) => (
                <li key={i}>
                  <Icon n="circle-check" /> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="jd__section">
            <h3>{t("aboutSponsorship")}</h3>
            <p>{t("sponsorshipText")}</p>
          </div>
        </div>

        <aside className="jd__aside">
          <div className="card applycard">
            <div className="applycard__sal">
              {job.salary} <small>{t("baseSalarySuffix")}</small>
            </div>
            <hr />
            <div className="applycard__row">
              <span>{t("visaType")}</span>
              <span>{job.visa}</span>
            </div>
            <div className="applycard__row applycard__row--stack">
              <span>{t("location")}</span>
              <span>{job.location}</span>
            </div>
            <div className="applycard__row">
              <span>{t("openingsShort")}</span>
              <span>{job.openings}</span>
            </div>
            {job.postedLabel && (
              <div className="applycard__row">
                <span>{t("posted")}</span>
                <span>{job.postedLabel}</span>
              </div>
            )}
            <Link
              className="btn btn--primary btn--block btn--lg"
              href={`/vagas/${job.id}/aplicar`}
              style={{ marginTop: 16 }}
            >
              <Icon n="send" /> {t("applyHere")}
            </Link>
          </div>

          {job.observations && (
            <div className="obsbox">
              <div className="obsbox__title">
                <Icon n="tag" /> {t("observationsTitle")}
              </div>
              <div className="obsbox__body">{job.observations}</div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <SupportCta />
          </div>
        </aside>
      </div>
    </div>
  );
}
