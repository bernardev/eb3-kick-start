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

function FieldView({ meta, value, onChange }: { meta: FieldMeta; value: string; onChange: (v: string) => void }) {
  const L = useLabel();
  if (meta.type === "radio" && meta.options) {
    return (
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label className="field__label">{L(meta)}</label>
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
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label className="field__label">{L(meta)}</label>
        <textarea className="input" style={{ minHeight: 90 }} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  return (
    <div className="field">
      <label className="field__label">{L(meta)}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function YesNo({ question, value, onChange }: { question: string; value: string; onChange: (v: string) => void }) {
  const L = useLabel();
  return (
    <div className="field" style={{ gridColumn: "1 / -1" }}>
      <label className="field__label">{question}</label>
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

export function G1Form({ job, defaultEmail }: { job: JobInfo; defaultEmail?: string }) {
  const t = useTranslations("g1");
  const tc = useTranslations("consent");
  const locale = useLocale();
  const L = useLabel();

  const [data, setData] = useState<G1Data>(() => {
    const d = emptyG1();
    if (defaultEmail) d.additional.email = defaultEmail;
    return d;
  });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (path: (string | number)[], value: unknown) =>
    setData((prev) => {
      const next = structuredClone(prev);
      let cur: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i] as string] as Record<string, unknown>;
      cur[path[path.length - 1] as string] = value;
      return next;
    });
  const mutArr = (path: (string | number)[], fn: (arr: unknown[]) => void) =>
    setData((prev) => {
      const next = structuredClone(prev);
      fn(getIn(next, path) as unknown[]);
      return next;
    });

  const submit = () => {
    setError(null);
    if (!data.declaration.agreed) return setError(t("errAgree"));
    if (!consent) return setError(t("errConsent"));
    startTransition(async () => {
      const res = await submitG1({ jobId: job.id, data, consent });
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
        <h1>{t("successTitle")}</h1>
        <p>{t("successText", { job: job.title, employer: job.employer })}</p>
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

  const employmentBlock = (emp: Employment, base: (string | number)[]) => (
    <>
      <div className="formgrid">
        {EMPLOYMENT_FIELDS.map((f) => (
          <FieldView key={f.key} meta={f} value={emp[f.key as keyof Employment] as string} onChange={(v) => set([...base, f.key], v)} />
        ))}
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label className="field__label">{t("jobDetails")}</label>
        <textarea className="input" style={{ minHeight: 110 }} value={emp.jobDetails} onChange={(e) => set([...base, "jobDetails"], e.target.value)} />
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
            <FieldView key={f.key} meta={f} value={(data.personal as Record<string, string>)[f.key]} onChange={(v) => set(["personal", f.key], v)} />
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
            <FieldView key={f.key} meta={f} value={(data.address as Record<string, string>)[f.key]} onChange={(v) => set(["address", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_emergency")}>
        <div className="formgrid">
          {EMERGENCY_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.emergency as Record<string, string>)[f.key]} onChange={(v) => set(["emergency", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_social")}>
        <div className="formgrid">{social(data.social, ["social"])}</div>
      </SectionCard>

      <SectionCard title={t("sec_education")}>
        <div className="formgrid">
          {EDUCATION_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.education as Record<string, string>)[f.key]} onChange={(v) => set(["education", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_currentEmp")}>
        {employmentBlock(data.currentEmployment, ["currentEmployment"])}
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
            {employmentBlock(emp, ["previousEmployments", i])}
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => mutArr(["previousEmployments"], (a) => a.push(emptyEmployment()))}>
          <Icon n="plus" /> {t("addPrevEmp")}
        </button>
      </SectionCard>

      <SectionCard title={t("sec_addPersonal")}>
        <div className="formgrid">
          {ADDITIONAL_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.additional as Record<string, string>)[f.key]} onChange={(v) => set(["additional", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t("sec_family")}>
        {data.family.map((m, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__title" style={{ marginBottom: 12 }}>{m.relationship}</div>
            <div className="formgrid">
              {FAMILY_COLUMNS.map((f) => (
                <FieldView key={f.key} meta={f} value={(m as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["family", i, f.key], v)} />
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
            <FieldView key={f.key} meta={f} value={(data.spouse as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["spouse", f.key], v)} />
          ))}
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="field__label">{t("spouseJobDetails")}</label>
          <textarea className="input" style={{ minHeight: 90 }} value={data.spouse.jobDetails} onChange={(e) => set(["spouse", "jobDetails"], e.target.value)} />
        </div>
        <div className="g1block__title" style={{ margin: "14px 0 10px" }}>{t("spouseSocial")}</div>
        <div className="formgrid">{social(data.spouse.social, ["spouse", "social"])}</div>
      </SectionCard>

      <SectionCard title={t("sec_usEntry")}>
        <YesNo question={t("everInUs")} value={data.usEntry.everInUs} onChange={(v) => set(["usEntry", "everInUs"], v)} />
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
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field__label">{t("currentVisaStatus")}</label>
            <input className="input" value={data.visaCompliance.currentStatus} onChange={(e) => set(["visaCompliance", "currentStatus"], e.target.value)} />
          </div>
        </div>
        <YesNo question={t("violatedTerms")} value={data.visaCompliance.violatedTerms} onChange={(v) => set(["visaCompliance", "violatedTerms"], v)} />
        {data.visaCompliance.violatedTerms === "YES" && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="field__label">{t("ifYesExplain")}</label>
            <textarea className="input" style={{ minHeight: 80 }} value={data.visaCompliance.violatedDetails} onChange={(e) => set(["visaCompliance", "violatedDetails"], e.target.value)} />
          </div>
        )}
        <YesNo question={t("arrested")} value={data.visaCompliance.arrested} onChange={(v) => set(["visaCompliance", "arrested"], v)} />
        {data.visaCompliance.arrested === "YES" && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="field__label">{t("ifYesExplain")}</label>
            <textarea className="input" style={{ minHeight: 80 }} value={data.visaCompliance.arrestedDetails} onChange={(e) => set(["visaCompliance", "arrestedDetails"], e.target.value)} />
          </div>
        )}
        <YesNo question={t("stayedOver6m")} value={data.visaCompliance.stayedOver6m} onChange={(v) => set(["visaCompliance", "stayedOver6m"], v)} />
        {data.visaCompliance.stayedOver6m === "YES" && (
          <div className="field">
            <label className="field__label">{t("ifYesExplain")}</label>
            <textarea className="input" style={{ minHeight: 80 }} value={data.visaCompliance.stayedDetails} onChange={(e) => set(["visaCompliance", "stayedDetails"], e.target.value)} />
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
        <div className="field">
          <label className="field__label">{t("gcHistory")}</label>
          <textarea className="input" style={{ minHeight: 90 }} value={data.greenCard.history} onChange={(e) => set(["greenCard", "history"], e.target.value)} />
        </div>
        <YesNo question={t("childrenMedicare")} value={data.greenCard.childrenMedicare} onChange={(v) => set(["greenCard", "childrenMedicare"], v)} />
      </SectionCard>

      <SectionCard title={t("sec_medical")}>
        <YesNo question={t("criminalRecord")} value={data.medical.criminalRecord} onChange={(v) => set(["medical", "criminalRecord"], v)} />
        <YesNo question={t("violations")} value={data.medical.violations} onChange={(v) => set(["medical", "violations"], v)} />
        {data.medical.violations === "YES" && (
          <div className="formgrid" style={{ marginBottom: 12 }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="field__label">{t("details")}</label>
              <textarea className="input" style={{ minHeight: 70 }} value={data.medical.violationsDetails} onChange={(e) => set(["medical", "violationsDetails"], e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">{t("impairedCount")}</label>
              <input className="input" value={data.medical.impairedDrivingCount} onChange={(e) => set(["medical", "impairedDrivingCount"], e.target.value)} />
            </div>
          </div>
        )}
        <YesNo question={t("tb")} value={data.medical.tb} onChange={(v) => set(["medical", "tb"], v)} />
        <YesNo question={t("hepatitis")} value={data.medical.hepatitis} onChange={(v) => set(["medical", "hepatitis"], v)} />
        <YesNo question={t("hiv")} value={data.medical.hiv} onChange={(v) => set(["medical", "hiv"], v)} />
        <YesNo question={t("otherConditions")} value={data.medical.otherConditions} onChange={(v) => set(["medical", "otherConditions"], v)} />
        {data.medical.otherConditions === "YES" && (
          <textarea className="input" style={{ minHeight: 70 }} placeholder={t("details")} value={data.medical.otherDetails} onChange={(e) => set(["medical", "otherDetails"], e.target.value)} />
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
          <div className="field">
            <label className="field__label">{t("signature")}</label>
            <input className="input" value={data.declaration.signature} onChange={(e) => set(["declaration", "signature"], e.target.value)} />
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
        <button className="btn btn--primary btn--lg" type="button" onClick={submit} disabled={pending || !consent || !data.declaration.agreed}>
          <Icon n="send" /> {pending ? t("submitting") : t("submit")}
        </button>
        <Link className="btn btn--quiet" href={`/vagas/${job.id}`}>
          {t("cancel")}
        </Link>
      </div>
    </>
  );
}
