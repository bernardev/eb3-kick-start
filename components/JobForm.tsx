"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { saveJob, deleteJob } from "@/lib/actions/jobs";

type QuestionDraft = { label: string; helpText: string; type: "TEXT" | "TEXTAREA"; required: boolean };

export type JobFormData = {
  id?: string;
  title: string;
  employer: string;
  logo: string;
  location: string;
  type: string;
  visa: string;
  salary: string;
  openings: number;
  postedLabel: string;
  description: string;
  requirements: string[];
  published: boolean;
  questions: QuestionDraft[];
};

const EMPTY: JobFormData = {
  title: "", employer: "", logo: "", location: "", type: "Tempo integral",
  visa: "EB-3 · Unskilled", salary: "", openings: 1, postedLabel: "",
  description: "", requirements: [], published: true, questions: [],
};

export function JobForm({ initial }: { initial?: JobFormData }) {
  const router = useRouter();
  const t = useTranslations("jobForm");
  const base = initial ?? EMPTY;

  const [f, setF] = useState<Omit<JobFormData, "requirements" | "questions">>({
    id: base.id, title: base.title, employer: base.employer, logo: base.logo,
    location: base.location, type: base.type, visa: base.visa, salary: base.salary,
    openings: base.openings, postedLabel: base.postedLabel,
    description: base.description, published: base.published,
  });
  const [reqText, setReqText] = useState(base.requirements.join("\n"));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await saveJob({
        ...f,
        requirements: reqText.split("\n").map((r) => r.trim()).filter(Boolean),
        // O questionário por vaga foi substituído pelo Formulário G1.
        questions: base.questions ?? [],
      });
      if (res?.error) setError(res.error);
      // sucesso redireciona no servidor
    });
  };

  const onDelete = () => {
    if (!f.id) return;
    if (!confirm(t("removeConfirm"))) return;
    startTransition(async () => {
      await deleteJob(f.id!);
    });
  };

  return (
    <>
      {error && (
        <div className="formmsg formmsg--error">
          <Icon n="alert-triangle" /> {error}
        </div>
      )}

      <div className="card formcard">
        <h3>{t("data")}</h3>
        <div className="formgrid">
          <div className="field">
            <label className="field__label">{t("fTitle")}</label>
            <input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Auxiliar de Cozinha" />
          </div>
          <div className="field">
            <label className="field__label">{t("employer")}</label>
            <input className="input" value={f.employer} onChange={(e) => set("employer", e.target.value)} placeholder="Blue Ridge Hospitality" />
          </div>
          <div className="field">
            <label className="field__label">{t("location")}</label>
            <input className="input" value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Asheville, NC" />
          </div>
          <div className="field">
            <label className="field__label">{t("type")}</label>
            <input className="input" value={f.type} onChange={(e) => set("type", e.target.value)} placeholder="Tempo integral" />
          </div>
          <div className="field">
            <label className="field__label">{t("visa")}</label>
            <input className="input" value={f.visa} onChange={(e) => set("visa", e.target.value)} placeholder="EB-3 · Unskilled" />
          </div>
          <div className="field">
            <label className="field__label">{t("salary")}</label>
            <input className="input" value={f.salary} onChange={(e) => set("salary", e.target.value)} placeholder="$15.50/h" />
          </div>
          <div className="field">
            <label className="field__label">{t("openings")}</label>
            <input className="input" type="number" min={1} value={f.openings} onChange={(e) => set("openings", Number(e.target.value))} />
          </div>
          <div className="field">
            <label className="field__label">{t("logo")}</label>
            <input className="input" maxLength={4} value={f.logo} onChange={(e) => set("logo", e.target.value)} placeholder="BR" />
          </div>
          <div className="field">
            <label className="field__label">{t("postedLabel")}</label>
            <input className="input" value={f.postedLabel} onChange={(e) => set("postedLabel", e.target.value)} placeholder="2 dias atrás" />
          </div>
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label className="field__label">{t("description")}</label>
          <textarea className="input" style={{ minHeight: 110 }} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder={t("descriptionPlaceholder")} />
        </div>

        <div className="field">
          <label className="field__label">{t("requirements")}</label>
          <textarea className="input" style={{ minHeight: 90 }} value={reqText} onChange={(e) => setReqText(e.target.value)} />
        </div>

        <label className="consent" style={{ marginBottom: 0 }}>
          <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
          <span>{t("publishedLabel")}</span>
        </label>
      </div>

      <div className="g1note" style={{ marginTop: 4 }}>
        <Icon n="info-circle" />
        <div>{t("g1Note")}</div>
      </div>

      <div className="formactions">
        <button className="btn btn--primary btn--lg" onClick={submit} disabled={pending}>
          <Icon n="device-floppy" /> {pending ? t("saving") : t("save")}
        </button>
        <button className="btn btn--ghost" onClick={() => router.push("/admin/vagas")} disabled={pending} type="button">
          {t("cancel")}
        </button>
        {f.id && (
          <button className="btn btn--quiet" onClick={onDelete} disabled={pending} type="button" style={{ marginLeft: "auto", color: "var(--st-denied)" }}>
            <Icon n="trash" /> {t("removeJob")}
          </button>
        )}
      </div>
    </>
  );
}
