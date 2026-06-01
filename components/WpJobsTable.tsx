import { Icon } from "./Icon";
import type { WpJob } from "@/lib/wp-jobs";

// Tabela das vagas do site (board do WordPress). Cada linha leva à vaga
// no kick-start.us. Apenas a tabela — o cabeçalho fica na página.
export function WpJobsTable({ jobs }: { jobs: WpJob[] }) {
  return (
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
  );
}
