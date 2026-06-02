"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Timeline } from "./Timeline";
import { PhaseCard } from "./PhaseCard";
import { STATUS_KEY, derivePhaseStatus, type StatusKey } from "@/lib/status";
import type { UiPhase } from "@/lib/types";

// Corpo do processo, usado tanto no portal do cliente (somente leitura)
// quanto no editor de caso do admin (editable).
export function ProcessView({
  phases,
  editable = false,
  initialOpen = [],
}: {
  phases: UiPhase[];
  editable?: boolean;
  initialOpen?: string[];
}) {
  const t = useTranslations("portal");
  const [openIds, setOpenIds] = useState<string[]>(initialOpen);
  const toggle = (id: string) =>
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const derived: { phase: UiPhase; status: StatusKey }[] = phases.map((p) => ({
    phase: p,
    status: derivePhaseStatus(p.steps),
  }));

  const allSteps = phases.flatMap((p) => p.steps);
  const approved = allSteps.filter((s) => STATUS_KEY[s.status] === "approved").length;
  const pct = allSteps.length ? Math.round((approved / allSteps.length) * 100) : 0;
  const tlStatuses = derived.map((d) => d.status);
  const current =
    derived.find((d) => d.status === "analysis" || d.status === "pending") ??
    derived[derived.length - 1];

  return (
    <>
      <div className="card progresscard">
        <div className="progress__top">
          <div>
            <div className="kicker">{t("progress")}</div>
            <div className="lead">{t("currentStep", { phase: current?.phase.title ?? "—" })}</div>
          </div>
          <div className="pct">
            {pct}
            <small>%</small>
          </div>
        </div>
        <div className="bar">
          <div className="bar__fill" style={{ width: pct + "%" }} />
        </div>
        <Timeline statuses={tlStatuses} />
      </div>

      <div className="kicker" style={{ margin: "6px 0 12px" }}>
        {t("phasesTitle")}
      </div>
      <div className="phases">
        {derived.map((d, i) => (
          <PhaseCard
            key={d.phase.id}
            phase={d.phase}
            index={i + 1}
            total={derived.length}
            derivedStatus={d.status}
            editable={editable}
            open={openIds.includes(d.phase.id)}
            onToggle={() => toggle(d.phase.id)}
          />
        ))}
      </div>
    </>
  );
}
