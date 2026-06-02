"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { PHASE_NODES, type StatusKey } from "@/lib/status";

// Timeline de pontos (estilo padrão do design aprovado) com as 4 fases.
export function Timeline({ statuses }: { statuses: StatusKey[] }) {
  const ts = useTranslations("status");
  const tp = useTranslations("phases");
  return (
    <div className="tl">
      {PHASE_NODES.map((n, i) => (
        <Fragment key={n.key}>
          <div className="tl__node">
            <div className={`tl__dot s-${statuses[i]}`} />
            <div className="tl__lbl">{tp(n.key)}</div>
            <div className="tl__st">{ts(statuses[i])}</div>
          </div>
          {i < PHASE_NODES.length - 1 && (
            <div className={"tl__line" + (statuses[i] === "approved" ? " s-done" : "")} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
