import { Fragment } from "react";
import { PHASE_NODES, STATUS, type StatusKey } from "@/lib/status";

// Timeline de pontos (estilo padrão do design aprovado) com as 4 fases.
export function Timeline({ statuses }: { statuses: StatusKey[] }) {
  return (
    <div className="tl">
      {PHASE_NODES.map((n, i) => (
        <Fragment key={n.key}>
          <div className="tl__node">
            <div className={`tl__dot s-${statuses[i]}`} />
            <div className="tl__lbl">{n.label}</div>
            <div className="tl__st">{STATUS[statuses[i]].label}</div>
          </div>
          {i < PHASE_NODES.length - 1 && (
            <div className={"tl__line" + (statuses[i] === "approved" ? " s-done" : "")} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
