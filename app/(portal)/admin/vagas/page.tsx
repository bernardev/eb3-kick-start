import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

// Lista de vagas EB-3 para a equipe gerenciar.
export default async function AdminVagasPage() {
  await requireAdmin();
  const t = await getTranslations("admin");

  const jobs = await prisma.eb3Job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="container container--wide">
      <div className="pagehead">
        <div>
          <div className="kicker">{t("panelKicker")}</div>
          <h1>{t("jobsTitle")}</h1>
          <p>{t("jobsSubtitle")}</p>
        </div>
        <Link className="btn btn--primary" href="/admin/vagas/nova">
          <Icon n="plus" /> {t("newJob")}
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="briefcase-off" />
            </div>
            <h3>{t("noJobsTitle")}</h3>
            <p>{t("noJobsText")}</p>
            <Link className="btn btn--ghost" href="/admin/vagas/nova">
              <Icon n="plus" /> {t("newJob")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="tablewrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("colJob")}</th>
                <th>{t("colLocal")}</th>
                <th>{t("colVisa")}</th>
                <th>{t("colApplications")}</th>
                <th>{t("colStatus")}</th>
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
                  <td>{j._count.applications}</td>
                  <td>
                    {j.published ? (
                      <span className="badge badge--approved">
                        <span className="ico-dot" /> {t("published")}
                      </span>
                    ) : (
                      <span className="badge badge--none">
                        <span className="ico-dot" /> {t("draft")}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link className="editlink" href={`/admin/vagas/${j.id}`}>
                      {t("edit")} <Icon n="arrow-right" />
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
