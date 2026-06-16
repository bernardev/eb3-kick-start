"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Icon } from "./Icon";
import { submitG1 } from "@/lib/actions/applications";
import {
  emptyG1, emptyEmployment,
  PERSONAL_FIELDS, ADDRESS_FIELDS, EMERGENCY_FIELDS, SOCIAL_FIELDS, EDUCATION_FIELDS,
  EMPLOYMENT_FIELDS, ADDITIONAL_FIELDS, FAMILY_COLUMNS, SPOUSE_FIELDS, SSN_COLUMNS,
  COUNTRY_COLUMNS, ENTRY_COLUMNS, IMPORTANT_QUESTIONS, DECLARATION_CLAUSES, YESNO_OPTIONS,
  type FieldMeta, type G1Data, type Employment, type SocialMedia,
} from "@/lib/g1";

type JobInfo = { id: string; title: string; employer: string; visa: string };

// rótulo de um campo no idioma atual
function useLabel() {
  const locale = useLocale();
  return (f: { en: string; pt: string }) => (locale === "en" ? f.en : f.pt);
}

// Asterisco vermelho para campos obrigatórios.
function Req() {
  return <span className="req-star" aria-hidden="true"> *</span>;
}

function FieldView({ meta, value, onChange, invalid }: { meta: FieldMeta; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const L = useLabel();
  if (meta.type === "radio" && meta.options) {
    return (
      <div className={"field" + (invalid ? " is-invalid" : "")} style={{ gridColumn: "1 / -1" }}>
        <label className="field__label">{L(meta)}{meta.req && <Req />}</label>
        <div className="g1radio">
          {meta.options.map((o) => (
            <label key={o.value} className={"g1opt" + (value === o.value ? " is-on" : "")}>
              <input type="radio" checked={value === o.value} onChange={() => onChange(o.value)} />
              {L(o)}
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (meta.type === "textarea") {
    return (
      <div className={"field" + (invalid ? " is-invalid" : "")} style={{ gridColumn: "1 / -1" }}>
        <label className="field__label">{L(meta)}{meta.req && <Req />}</label>
        <textarea className={"input" + (invalid ? " is-invalid" : "")} style={{ minHeight: 90 }} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  return (
    <div className={"field" + (invalid ? " is-invalid" : "")}>
      <label className="field__label">{L(meta)}{meta.req && <Req />}</label>
      <input className={"input" + (invalid ? " is-invalid" : "")} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function YesNo({ question, value, onChange, req, invalid }: { question: string; value: string; onChange: (v: string) => void; req?: boolean; invalid?: boolean }) {
  const L = useLabel();
  return (
    <div className={"field" + (invalid ? " is-invalid" : "")} style={{ gridColumn: "1 / -1" }}>
      <label className="field__label">{question}{req && <Req />}</label>
      <div className="g1radio">
        {YESNO_OPTIONS.map((o) => (
          <label key={o.value} className={"g1opt" + (value === o.value ? " is-on" : "")}>
            <input type="radio" checked={value === o.value} onChange={() => onChange(o.value)} />
            {L(o)}
          </label>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card formcard">
      <h3 className="g1card-title">{title}</h3>
      {children}
    </div>
  );
}

function getIn(obj: unknown, path: (string | number)[]): unknown {
  let cur: unknown = obj;
  for (const k of path) cur = (cur as Record<string, unknown>)[k as string];
  return cur;
}

export function G1Form({
  job,
  defaultEmail,
  initialData,
  applicationId,
}: {
  job: JobInfo;
  defaultEmail?: string;
  initialData?: G1Data;
  applicationId?: string;
}) {
  const t = useTranslations("g1");
  const tc = useTranslations("consent");
  const locale = useLocale();
  const L = useLabel();
  const isEdit = !!applicationId;

  const [data, setData] = useState<G1Data>(() => {
    if (initialData) return structuredClone(initialData);
    const d = emptyG1();
    if (defaultEmail) d.additional.email = defaultEmail;
    return d;
  });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  // chave única de um campo (caminho) e teste de "obrigatório em branco".
  const km = (path: (string | number)[]) => path.join(".");
  const inv = (path: (string | number)[]) => missing.has(km(path));

  const set = (path: (string | number)[], value: unknown) => {
    // ao editar, remove a marcação de erro daquele campo.
    setMissing((prev) => {
      if (!prev.has(km(path))) return prev;
      const next = new Set(prev);
      next.delete(km(path));
      return next;
    });
    setData((prev) => {
      const next = structuredClone(prev);
      let cur: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i] as string] as Record<string, unknown>;
      cur[path[path.length - 1] as string] = value;
      return next;
    });
  };
  const mutArr = (path: (string | number)[], fn: (arr: unknown[]) => void) =>
    setData((prev) => {
      const next = structuredClone(prev);
      fn(getIn(next, path) as unknown[]);
      return next;
    });

  // valor "em branco" (string vazia/espacos ou ausente).
  const empty = (v: unknown) => v == null || (typeof v === "string" && v.trim() === "");

  // Lista os caminhos dos campos obrigatórios ainda em branco.
  const collectMissing = (d: G1Data): string[] => {
    const miss: string[] = [];
    const check = (base: (string | number)[], fields: FieldMeta[], obj: Record<string, string>) => {
      for (const f of fields) if (f.req && empty(obj[f.key])) miss.push(km([...base, f.key]));
    };
    const rec = (o: unknown) => o as unknown as Record<string, string>;

    check(["personal"], PERSONAL_FIELDS, rec(d.personal));
    check(["address"], ADDRESS_FIELDS, rec(d.address));
    check(["emergency"], EMERGENCY_FIELDS, rec(d.emergency));
    check(["education"], EDUCATION_FIELDS, rec(d.education));

    check(["currentEmployment"], EMPLOYMENT_FIELDS, rec(d.currentEmployment));
    if (empty(d.currentEmployment.jobDetails)) miss.push("currentEmployment.jobDetails");

    check(["previousEmployments", 0], EMPLOYMENT_FIELDS, rec(d.previousEmployments[0]));
    if (empty(d.previousEmployments[0]?.jobDetails)) miss.push("previousEmployments.0.jobDetails");

    check(["additional"], ADDITIONAL_FIELDS, rec(d.additional));

    // Família: nome de cada linha (cônjuge + filhos) — "N/A" se não houver.
    d.family.forEach((m, i) => { if (empty(m.nameEnglish)) miss.push(km(["family", i, "nameEnglish"])); });

    check(["spouse"], SPOUSE_FIELDS, rec(d.spouse));
    if (empty(d.spouse.jobDetails)) miss.push("spouse.jobDetails");

    if (empty(d.usEntry.everInUs)) miss.push("usEntry.everInUs");

    if (empty(d.visaCompliance.currentStatus)) miss.push("visaCompliance.currentStatus");
    if (empty(d.visaCompliance.violatedTerms)) miss.push("visaCompliance.violatedTerms");
    else if (d.visaCompliance.violatedTerms === "YES" && empty(d.visaCompliance.violatedDetails)) miss.push("visaCompliance.violatedDetails");
    if (empty(d.visaCompliance.arrested)) miss.push("visaCompliance.arrested");
    else if (d.visaCompliance.arrested === "YES" && empty(d.visaCompliance.arrestedDetails)) miss.push("visaCompliance.arrestedDetails");
    if (empty(d.visaCompliance.stayedOver6m)) miss.push("visaCompliance.stayedOver6m");
    else if (d.visaCompliance.stayedOver6m === "YES" && empty(d.visaCompliance.stayedDetails)) miss.push("visaCompliance.stayedDetails");

    if (empty(d.greenCard.history)) miss.push("greenCard.history");

    (["criminalRecord", "violations", "tb", "hepatitis", "hiv", "otherConditions"] as const).forEach((k) => {
      if (empty(d.medical[k])) miss.push(km(["medical", k]));
    });
    if (d.medical.violations === "YES" && empty(d.medical.violationsDetails)) miss.push("medical.violationsDetails");
    if (d.medical.otherConditions === "YES" && empty(d.medical.otherDetails)) miss.push("medical.otherDetails");

    IMPORTANT_QUESTIONS.forEach((q) => { if (empty(d.importantQuestions[q.key])) miss.push(km(["importantQuestions", q.key])); });

    if (empty(d.declaration.signature)) miss.push("declaration.signature");
    return miss;
  };

  const submit = () => {
    setError(null);
    const miss = collectMissing(data);
    if (miss.length > 0) {
      setMissing(new Set(miss));
      setError(t("errRequired", { count: miss.length }));
      // rola até o primeiro campo destacado depois do re-render.
      setTimeout(() => {
        document.querySelector(".field.is-invalid, .input.is-invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
      return;
    }
    setMissing(new Set());
    if (!data.declaration.agreed) return setError(t("errAgree"));
    if (!consent) return setError(t("errConsent"));
    startTransition(async () => {
      const res = await submitG1({ jobId: job.id, data, consent, applicationId });
      if (res?.error) setError(res.error);
      else setOk(true);
    });
  };

  if (ok) {
    return (
      <div className="success">
        <div className="success__badge">
          <Icon n="circle-check" />
        </div>
        <h1>{isEdit ? t("editSuccessTitle") : t("successTitle")}</h1>
        <p>{isEdit ? t("editSuccessText", { job: job.title, employer: job.employer }) : t("successText", { job: job.title, employer: job.employer })}</p>
        <div className="welcome__actions" style={{ marginTop: 28 }}>
          <Link className="btn btn--primary btn--lg" href="/meu-processo">
            <Icon n="route" /> {t("successProcess")}
          </Link>
          <Link className="btn btn--ghost btn--lg" href="/vagas">
            <Icon n="briefcase" /> {t("successOtherJobs")}
          </Link>
        </div>
      </div>
    );
  }

  const social = (root: SocialMedia, base: (string | number)[]) =>
    SOCIAL_FIELDS.map((f) => (
      <FieldView key={f.key} meta={f} value={root[f.key as keyof SocialMedia]} onChange={(v) => set([...base, f.key], v)} />
    ));

  const employmentBlock = (emp: Employment, base: (string | number)[], reqDetails = false) => (
    <>
      <div className="formgrid">
        {EMPLOYMENT_FIELDS.map((f) => (
          <FieldView key={f.key} meta={f} value={emp[f.key as keyof Employment] as string} onChange={(v) => set([...base, f.key], v)} invalid={inv([...base, f.key])} />
        ))}
      </div>
      <div className={"field" + (inv([...base, "jobDetails"]) ? " is-invalid" : "")} style={{ marginTop: 12 }}>
        <label className="field__label">{t("jobDetails")}{reqDetails && <Req />}</label>
        <textarea className={"input" + (inv([...base, "jobDetails"]) ? " is-invalid" : "")} style={{ minHeight: 110 }} value={emp.jobDetails} onChange={(e) => set([...base, "jobDetails"], e.target.value)} />
      </div>
    </>
  );

  const iq = (q: { en: string; pt: string }) => (locale === "en" ? q.en : q.pt);

  return (
    <>
      <div className="g1note">
        <Icon n="alert-triangle" />
        <div>{t("capsNote")}</div>
      </div>

      {/* PERSONAL */}
      <SectionCard title={t("sec_personal")}>
        <div className="formgrid">
          {PERSONAL_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.personal as Record<string, string>)[f.key]} onChange={(v) => set(["personal", f.key], v)} invalid={inv(["personal", f.key])} />
          ))}
        </div>
        {data.personal.sex === "OTHER" && (
          <div className="field" style={{ marginTop: 8 }}>
            <label className="field__label">{t("other")}</label>
            <input className="input" value={data.personal.sexOther} onChange={(e) => set(["personal", "sexOther"], e.target.value)} />
          </div>
        )}
        <div className="g1note" style={{ marginTop: 12, marginBottom: 0 }}>
          <Icon n="alert-triangle" />
          <div>{t("marriageNote")}</div>
        </div>
      </SectionCard>

      <SectionCard title={t("sec_address")}>
        <div className="formgrid">
          {ADDRESS_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.address as Record<string, string>)[f.key]} onChange={(v) => set(["address", f.key], v)} invalid={inv(["address", f.key])} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_emergency")}>
        <div className="formgrid">
          {EMERGENCY_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.emergency as Record<string, string>)[f.key]} onChange={(v) => set(["emergency", f.key], v)} invalid={inv(["emergency", f.key])} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_social")}>
        <div className="formgrid">{social(data.social, ["social"])}</div>
      </SectionCard>

      <SectionCard title={t("sec_education")}>
        <div className="formgrid">
          {EDUCATION_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.education as Record<string, string>)[f.key]} onChange={(v) => set(["education", f.key], v)} invalid={inv(["education", f.key])} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_currentEmp")}>
        {employmentBlock(data.currentEmployment, ["currentEmployment"], true)}
      </SectionCard>

      <SectionCard title={t("sec_prevEmp")}>
        {data.previousEmployments.map((emp, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__head">
              <span className="g1block__title">#{i + 1}</span>
              {data.previousEmployments.length > 1 && (
                <button type="button" className="iconbtn" onClick={() => mutArr(["previousEmployments"], (a) => a.splice(i, 1))} title="✕">
                  <Icon n="trash" />
                </button>
              )}
            </div>
            {employmentBlock(emp, ["previousEmployments", i], i === 0)}
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => mutArr(["previousEmployments"], (a) => a.push(emptyEmployment()))}>
          <Icon n="plus" /> {t("addPrevEmp")}
        </button>
      </SectionCard>

      <SectionCard title={t("sec_addPersonal")}>
        <div className="formgrid">
          {ADDITIONAL_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.additional as Record<string, string>)[f.key]} onChange={(v) => set(["additional", f.key], v)} invalid={inv(["additional", f.key])} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_family")}>
        {data.family.map((m, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__title" style={{ marginBottom: 12 }}>{m.relationship}</div>
            <div className="formgrid">
              {FAMILY_COLUMNS.map((f) => (
                <FieldView key={f.key} meta={f} value={(m as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["family", i, f.key], v)} invalid={inv(["family", i, f.key])} />
              ))}
            </div>
          </div>
        ))}
        <div className="field">
          <label className="field__label">{t("familyAddress")}</label>
          <input className="input" value={data.familyAddress} onChange={(e) => set(["familyAddress"], e.target.value)} />
        </div>
      </SectionCard>

      <SectionCard title={t("sec_spouse")}>
        <div className="formgrid">
          {SPOUSE_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.spouse as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["spouse", f.key], v)} invalid={inv(["spouse", f.key])} />
          ))}
        </div>
        <div className={"field" + (inv(["spouse", "jobDetails"]) ? " is-invalid" : "")} style={{ marginTop: 12 }}>
          <label className="field__label">{t("spouseJobDetails")}<Req /></label>
          <textarea className={"input" + (inv(["spouse", "jobDetails"]) ? " is-invalid" : "")} style={{ minHeight: 90 }} value={data.spouse.jobDetails} onChange={(e) => set(["spouse", "jobDetails"], e.target.value)} />
        </div>
        <div className="g1block__title" style={{ margin: "14px 0 10px" }}>{t("spouseSocial")}</div>
        <div className="formgrid">{social(data.spouse.social, ["spouse", "social"])}</div>
      </SectionCard>

      <SectionCard title={t("sec_usEntry")}>
        <YesNo question={t("everInUs")} value={data.usEntry.everInUs} onChange={(v) => set(["usEntry", "everInUs"], v)} req invalid={inv(["usEntry", "everInUs"])} />
        {data.usEntry.people.map((p, pi) => (
          <div className="g1block" key={pi}>
            <div className="g1block__title" style={{ marginBottom: 12 }}>{p.name}</div>
            <div className="formgrid">
              <div className="field">
                <label className="field__label">{t("name")}</label>
                <input className="input" value={p.name} onChange={(e) => set(["usEntry", "people", pi, "name"], e.target.value)} />
              </div>
              <div className="field">
                <label className="field__label">I-94 #</label>
                <input className="input" value={p.i94} onChange={(e) => set(["usEntry", "people", pi, "i94"], e.target.value)} />
              </div>
            </div>
            {p.entries.map((en, ei) => (
              <div className="formgrid" key={ei} style={{ marginTop: 8 }}>
                {ENTRY_COLUMNS.map((f) => (
                  <FieldView key={f.key} meta={f} value={(en as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["usEntry", "people", pi, "entries", ei, f.key], v)} />
                ))}
              </div>
            ))}
            <button type="button" className="btn btn--quiet btn--sm" style={{ marginTop: 8 }} onClick={() => mutArr(["usEntry", "people", pi, "entries"], (a) => a.push({ date: "", port: "", visaType: "" }))}>
              <Icon n="plus" /> {t("addEntry")}
            </button>
          </div>
        ))}
      </SectionCard>

      <SectionCard title={t("sec_visa")}>
        <div className="formgrid">
          <div className={"field" + (inv(["visaCompliance", "currentStatus"]) ? " is-invalid" : "")} style={{ gridColumn: "1 / -1" }}>
            <label className="field__label">{t("currentVisaStatus")}<Req /></label>
            <input className={"input" + (inv(["visaCompliance", "currentStatus"]) ? " is-invalid" : "")} value={data.visaCompliance.currentStatus} onChange={(e) => set(["visaCompliance", "currentStatus"], e.target.value)} />
          </div>
        </div>
        <YesNo question={t("violatedTerms")} value={data.visaCompliance.violatedTerms} onChange={(v) => set(["visaCompliance", "violatedTerms"], v)} req invalid={inv(["visaCompliance", "violatedTerms"])} />
        {data.visaCompliance.violatedTerms === "YES" && (
          <div className={"field" + (inv(["visaCompliance", "violatedDetails"]) ? " is-invalid" : "")} style={{ marginBottom: 12 }}>
            <label className="field__label">{t("ifYesExplain")}<Req /></label>
            <textarea className={"input" + (inv(["visaCompliance", "violatedDetails"]) ? " is-invalid" : "")} style={{ minHeight: 80 }} value={data.visaCompliance.violatedDetails} onChange={(e) => set(["visaCompliance", "violatedDetails"], e.target.value)} />
          </div>
        )}
        <YesNo question={t("arrested")} value={data.visaCompliance.arrested} onChange={(v) => set(["visaCompliance", "arrested"], v)} req invalid={inv(["visaCompliance", "arrested"])} />
        {data.visaCompliance.arrested === "YES" && (
          <div className={"field" + (inv(["visaCompliance", "arrestedDetails"]) ? " is-invalid" : "")} style={{ marginBottom: 12 }}>
            <label className="field__label">{t("ifYesExplain")}<Req /></label>
            <textarea className={"input" + (inv(["visaCompliance", "arrestedDetails"]) ? " is-invalid" : "")} style={{ minHeight: 80 }} value={data.visaCompliance.arrestedDetails} onChange={(e) => set(["visaCompliance", "arrestedDetails"], e.target.value)} />
          </div>
        )}
        <YesNo question={t("stayedOver6m")} value={data.visaCompliance.stayedOver6m} onChange={(v) => set(["visaCompliance", "stayedOver6m"], v)} req invalid={inv(["visaCompliance", "stayedOver6m"])} />
        {data.visaCompliance.stayedOver6m === "YES" && (
          <div className={"field" + (inv(["visaCompliance", "stayedDetails"]) ? " is-invalid" : "")}>
            <label className="field__label">{t("ifYesExplain")}<Req /></label>
            <textarea className={"input" + (inv(["visaCompliance", "stayedDetails"]) ? " is-invalid" : "")} style={{ minHeight: 80 }} value={data.visaCompliance.stayedDetails} onChange={(e) => set(["visaCompliance", "stayedDetails"], e.target.value)} />
          </div>
        )}
      </SectionCard>

      <SectionCard title={t("sec_ssn")}>
        {data.ssn.map((row, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__head">
              <span className="g1block__title">#{i + 1}</span>
              {data.ssn.length > 1 && (
                <button type="button" className="iconbtn" onClick={() => mutArr(["ssn"], (a) => a.splice(i, 1))} title="✕"><Icon n="trash" /></button>
              )}
            </div>
            <div className="formgrid">
              {SSN_COLUMNS.map((f) => (
                <FieldView key={f.key} meta={f} value={(row as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["ssn", i, f.key], v)} />
              ))}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => mutArr(["ssn"], (a) => a.push({ fullName: "", ssn: "", alienNumber: "", visaStatus: "" }))}>
          <Icon n="plus" /> {t("addRow")}
        </button>
      </SectionCard>

      <SectionCard title={t("sec_greenCard")}>
        <div className={"field" + (inv(["greenCard", "history"]) ? " is-invalid" : "")}>
          <label className="field__label">{t("gcHistory")}<Req /></label>
          <textarea className={"input" + (inv(["greenCard", "history"]) ? " is-invalid" : "")} style={{ minHeight: 90 }} value={data.greenCard.history} onChange={(e) => set(["greenCard", "history"], e.target.value)} />
        </div>
        <YesNo question={t("childrenMedicare")} value={data.greenCard.childrenMedicare} onChange={(v) => set(["greenCard", "childrenMedicare"], v)} />
      </SectionCard>

      <SectionCard title={t("sec_medical")}>
        <YesNo question={t("criminalRecord")} value={data.medical.criminalRecord} onChange={(v) => set(["medical", "criminalRecord"], v)} req invalid={inv(["medical", "criminalRecord"])} />
        <YesNo question={t("violations")} value={data.medical.violations} onChange={(v) => set(["medical", "violations"], v)} req invalid={inv(["medical", "violations"])} />
        {data.medical.violations === "YES" && (
          <div className="formgrid" style={{ marginBottom: 12 }}>
            <div className={"field" + (inv(["medical", "violationsDetails"]) ? " is-invalid" : "")} style={{ gridColumn: "1 / -1" }}>
              <label className="field__label">{t("details")}<Req /></label>
              <textarea className={"input" + (inv(["medical", "violationsDetails"]) ? " is-invalid" : "")} style={{ minHeight: 70 }} value={data.medical.violationsDetails} onChange={(e) => set(["medical", "violationsDetails"], e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">{t("impairedCount")}</label>
              <input className="input" value={data.medical.impairedDrivingCount} onChange={(e) => set(["medical", "impairedDrivingCount"], e.target.value)} />
            </div>
          </div>
        )}
        <YesNo question={t("tb")} value={data.medical.tb} onChange={(v) => set(["medical", "tb"], v)} req invalid={inv(["medical", "tb"])} />
        <YesNo question={t("hepatitis")} value={data.medical.hepatitis} onChange={(v) => set(["medical", "hepatitis"], v)} req invalid={inv(["medical", "hepatitis"])} />
        <YesNo question={t("hiv")} value={data.medical.hiv} onChange={(v) => set(["medical", "hiv"], v)} req invalid={inv(["medical", "hiv"])} />
        <YesNo question={t("otherConditions")} value={data.medical.otherConditions} onChange={(v) => set(["medical", "otherConditions"], v)} req invalid={inv(["medical", "otherConditions"])} />
        {data.medical.otherConditions === "YES" && (
          <textarea className={"input" + (inv(["medical", "otherDetails"]) ? " is-invalid" : "")} style={{ minHeight: 70 }} placeholder={t("details")} value={data.medical.otherDetails} onChange={(e) => set(["medical", "otherDetails"], e.target.value)} />
        )}
      </SectionCard>

      <SectionCard title={t("sec_countries")}>
        <YesNo question={t("livedAbroad")} value={data.countriesLived.livedAbroad} onChange={(v) => set(["countriesLived", "livedAbroad"], v)} />
        <div className="g1note"><Icon n="alert-triangle" /><div>{t("policeNote")}</div></div>
        {data.countriesLived.rows.map((row, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__head">
              <span className="g1block__title">#{i + 1}</span>
              {data.countriesLived.rows.length > 1 && (
                <button type="button" className="iconbtn" onClick={() => mutArr(["countriesLived", "rows"], (a) => a.splice(i, 1))} title="✕"><Icon n="trash" /></button>
              )}
            </div>
            <div className="formgrid">
              {COUNTRY_COLUMNS.map((f) => (
                <FieldView key={f.key} meta={f} value={(row as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["countriesLived", "rows", i, f.key], v)} />
              ))}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => mutArr(["countriesLived", "rows"], (a) => a.push({ name: "", country: "", stays: "", visaType: "" }))}>
          <Icon n="plus" /> {t("addCountry")}
        </button>
      </SectionCard>

      <SectionCard title={t("sec_important")}>
        {IMPORTANT_QUESTIONS.map((q) => (
          <YesNo
            key={q.key}
            question={iq(q)}
            value={data.importantQuestions[q.key]}
            onChange={(v) => set(["importantQuestions", q.key], v)}
            req
            invalid={inv(["importantQuestions", q.key])}
          />
        ))}
      </SectionCard>

      <SectionCard title={t("sec_declaration")}>
        <ol className="g1clauses">
          {DECLARATION_CLAUSES.map((c, i) => (
            <li key={i}>
              <span>{L(c)}</span>
            </li>
          ))}
        </ol>
        <label className={"consent" + (data.declaration.agreed ? " is-checked" : "")} style={{ marginTop: 16 }}>
          <input type="checkbox" checked={data.declaration.agreed} onChange={(e) => set(["declaration", "agreed"], e.target.checked)} />
          <span>{t("declAgree")}</span>
        </label>
        <div className="formgrid" style={{ marginTop: 12 }}>
          <div className={"field" + (inv(["declaration", "signature"]) ? " is-invalid" : "")}>
            <label className="field__label">{t("signature")}<Req /></label>
            <input className={"input" + (inv(["declaration", "signature"]) ? " is-invalid" : "")} value={data.declaration.signature} onChange={(e) => set(["declaration", "signature"], e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">{t("date")}</label>
            <input className="input" value={data.declaration.date} onChange={(e) => set(["declaration", "date"], e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* AVISO + CONSENTIMENTO */}
      <div className="notice">
        <Icon n="alert-triangle" />
        <div>
          <div className="notice__t">{t("consentTitle")}</div>
          <p>{tc("notice")}</p>
        </div>
      </div>
      <label className={"consent" + (consent ? " is-checked" : "")}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{t("consentCheckbox")}</span>
      </label>

      {error && (
        <div className="formmsg formmsg--error">
          <Icon n="alert-triangle" /> {error}
        </div>
      )}

      <div className="formactions">
        <button className="btn btn--primary btn--lg" type="button" onClick={submit} disabled={pending}>
          <Icon n="send" /> {pending ? t("submitting") : isEdit ? t("submitEdit") : t("submit")}
        </button>
        <Link className="btn btn--quiet" href={`/vagas/${job.id}`}>
          {t("cancel")}
        </Link>
      </div>
    </>
  );
}
