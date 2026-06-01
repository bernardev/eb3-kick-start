import { requireUser } from "@/lib/guards";
import { getWpJobs, WP_JOBS_BOARD_URL } from "@/lib/wp-jobs";
import { Icon } from "@/components/Icon";
import { WpJobsTable } from "@/components/WpJobsTable";

export const dynamic = "force-dynamic";

// Aba dedicada: "Outras vagas" — vagas do site kick-start.us (board do
// WordPress), exceto EB-3. Cada vaga leva para o site.
export default async function OutrasVagasPage() {
  await requireUser();
  const jobs = await getWpJobs(12);

  return (
    <div className="container container--wide">
      <div className="pagehead">
        <div>
          <div className="kicker">Site Kick Start</div>
          <h1>Outras vagas</h1>
          <p>Vagas do kick-start.us (exigem ser membro). Clique para ver e candidatar-se no site.</p>
        </div>
        <a className="btn btn--ghost" href={WP_JOBS_BOARD_URL} target="_blank" rel="noopener noreferrer">
          <Icon n="external-link" /> Ver todas no site
        </a>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="world-search" />
            </div>
            <h3>Não foi possível carregar as vagas do site agora</h3>
            <p>Tente novamente em instantes ou veja todas as vagas direto no kick-start.us.</p>
            <a className="btn btn--ghost" href={WP_JOBS_BOARD_URL} target="_blank" rel="noopener noreferrer">
              <Icon n="external-link" /> Ver vagas no site
            </a>
          </div>
        </div>
      ) : (
        <WpJobsTable jobs={jobs} />
      )}
    </div>
  );
}
