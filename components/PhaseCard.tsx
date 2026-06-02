"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { StatusBadge, StatusDot } from "./Status";
import { STATUS_KEY, STATUS_OPTIONS, type StatusKey } from "@/lib/status";
import { updateStepStatus, updatePhaseNotes } from "@/lib/actions/cases";
import type { UiPhase } from "@/lib/types";
import type { CaseStatus } from "@prisma/client";

export function PhaseCard({
  phase,
  index,
  total,
  derivedStatus,
  editable,
  open,
  onToggle,
}: {
  phase: UiPhase;
  index: number;
  total: number;
  derivedStatus: StatusKey;
  editable: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("portal");
  const ts = useTranslations("status");
  const [notes, setNotes] = useState(phase.notes);
  const [flash, setFlash] = useState(false);
  const [pending, startTransition] = useTransition();

  const onStepChange = (stepId: string, value: StatusKey) => {
    startTransition(async () => {
      await updateStepStatus(stepId, value);
      router.refresh();
    });
  };

  const saveNotes = () => {
    startTransition(async () => {
      await updatePhaseNotes(phase.id, notes);
      router.refresh();
      setFlash(true);
      setTimeout(() => setFlash(false), 1900);
    });
  };

  return (
    <div className={"phase" + (open ? " is-open" : "")}>
      <div className="phase__head" onClick={onToggle} role="button" aria-expanded={open}>
        <div className={`phase__icon s-${derivedStatus}`}>
          <Icon n={phase.icon} />
        </div>
        <div className="phase__tw">
          <div className="phase__step-of">{t("phaseOf", { index, total })}</div>
          <div className="phase__title">{phase.title}</div>
          {phase.subtitle && <div className="phase__sub">{phase.subtitle}</div>}
        </div>
        <StatusBadge status={derivedStatus} />
        <Icon n="chevron-down" className="phase__chev" />
      </div>

      <div className="phase__body">
        <div className="phase__divider" />
        {phase.steps.map((st) => {
          const k = STATUS_KEY[st.status];
          return (
            <div className="step" key={st.id}>
              {!editable && <StatusDot status={k} />}
              <div className="step__name">
                {st.name}
                {st.sub && <span className="sub">{st.sub}</span>}
              </div>
              {editable ? (
                <div className="select step__select">
                  <select
                    value={st.status}
                    disabled={pending}
                    onChange={(e) => onStepChange(st.id, STATUS_KEY[e.target.value as CaseStatus])}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {ts(STATUS_KEY[o.value])}
                      </option>
                    ))}
                  </select>
                  <Icon n="selector" />
                </div>
              ) : (
                <StatusBadge status={k} withDot />
              )}
            </div>
          );
        })}

        <div className="notes">
          <div className="notes__label">
            <Icon n="message-2" /> {t("teamNotes")}
          </div>
          {editable ? (
            <>
              <textarea
                className="notes__ta"
                value={notes}
                placeholder={t("notesPlaceholder")}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="notes__actions">
                <button className="btn btn--primary btn--sm" onClick={saveNotes} disabled={pending}>
                  <Icon n="device-floppy" /> {t("saveNotes")}
                </button>
                <span className={"saved-flash" + (flash ? " show" : "")}>
                  <Icon n="check" /> {t("notesSaved")}
                </span>
              </div>
            </>
          ) : phase.notes ? (
            <>
              <div className="notes__box">{phase.notes}</div>
              <div className="notes__by">
                <span className="avatar">KS</span> Kick Start Team
              </div>
            </>
          ) : (
            <div className="notes__box is-empty">{t("noNotes")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
