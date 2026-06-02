import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/guards";
import { getWpJobs, WP_JOBS_BOARD_URL } from "@/lib/wp-jobs";
import { Icon } from "@/components/Icon";
import { WpJobsTable } from "@/components/WpJobsTable";

export const dynamic = "force-dynamic";

// Aba dedicada: "Outras vagas" — vagas do site kick-start.us (board do
// WordPress), exceto EB-3. Cada vaga leva para o site.
export default async function OutrasVagasPage() {
  await requireUser();
  const t = await getTranslations("otherJobs");
  const jobs = await getWpJobs(12);

  return (
    <div className="container container--wide">
      <div className="pagehead">
        <div>
          <div className="kicker">{t("kicker")}</div>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
        <a className="btn btn--ghost" href={WP_JOBS_BOARD_URL} target="_blank" rel="noopener noreferrer">
          <Icon n="external-link" /> {t("seeAll")}
        </a>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="world-search" />
            </div>
            <h3>{t("errorTitle")}</h3>
            <p>{t("errorText")}</p>
            <a className="btn btn--ghost" href={WP_JOBS_BOARD_URL} target="_blank" rel="noopener noreferrer">
              <Icon n="external-link" /> {t("seeJobsSite")}
            </a>
          </div>
        </div>
      ) : (
        <WpJobsTable jobs={jobs} />
      )}
    </div>
  );
}
