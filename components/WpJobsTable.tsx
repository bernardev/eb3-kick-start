import { Icon } from "./Icon";
import { WP_JOBS_BOARD_URL, type WpJob } from "@/lib/wp-jobs";

// Seção "Outras vagas" — vagas do site kick-start.us (board do WordPress),
// puxadas ao vivo. Cada linha leva à vaga no site.
export function WpJobsTable({ jobs }: { jobs: WpJob[] }) {
  if (jobs.length === 0) return null;

  return (
    <div style={{ marginTop: 44 }}>
      <div className="pagehead" style={{ marginBottom: 18 }}>
        <div>
          <div className="kicker">Site Kick Start</div>
          <h1 style={{ fontSize: 22 }}>Outras vagas</h1>
          <p>Vagas do kick-start.us (exigem ser membro). Clique para ver e candidatar-se no site.</p>
        </div>
        <a className="btn btn--ghost" href={WP_JOBS_BOARD_URL} target="_blank" rel="noopener noreferrer">
          <Icon n="external-link" /> Ver todas no site
        </a>
      </div>

      <div className="tablewrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Localização</th>
              <th>Categoria</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>
                  <div className="tbl__title">{j.title}</div>
                </td>
                <td>
                  {j.location ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Icon n="map-pin" /> {j.location}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {j.visa ? (
                    <span className="visa-tag">
                      <Icon n="license" /> {j.visa}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <a className="editlink" href={j.link} target="_blank" rel="noopener noreferrer">
                    Ver no site <Icon n="external-link" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
