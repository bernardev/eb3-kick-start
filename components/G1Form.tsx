"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { submitG1 } from "@/lib/actions/applications";
import { CONSENT_NOTICE, CONSENT_CHECKBOX } from "@/lib/consent";
import {
  emptyG1, emptyEmployment, bi,
  PERSONAL_FIELDS, ADDRESS_FIELDS, EMERGENCY_FIELDS, SOCIAL_FIELDS, EDUCATION_FIELDS,
  EMPLOYMENT_FIELDS, ADDITIONAL_FIELDS, FAMILY_COLUMNS, SPOUSE_FIELDS, SSN_COLUMNS,
  COUNTRY_COLUMNS, ENTRY_COLUMNS, IMPORTANT_QUESTIONS, DECLARATION_CLAUSES, YESNO_OPTIONS,
  type FieldMeta, type G1Data, type Employment, type SocialMedia,
} from "@/lib/g1";

type JobInfo = { id: string; title: string; employer: string; visa: string };

// ---------- helpers de campo ----------
function FieldView({ meta, value, onChange }: { meta: FieldMeta; value: string; onChange: (v: string) => void }) {
  const label = bi(meta);
  if (meta.type === "radio" && meta.options) {
    return (
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label className="field__label">{label}</label>
        <div className="g1radio">
          {meta.options.map((o) => (
            <label key={o.value} className={"g1opt" + (value === o.value ? " is-on" : "")}>
              <input type="radio" checked={value === o.value} onChange={() => onChange(o.value)} />
              {o.en} / {o.pt}
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (meta.type === "textarea") {
    return (
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label className="field__label">{label}</label>
        <textarea className="input" style={{ minHeight: 90 }} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function YesNo({ question, value, onChange }: { question: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field" style={{ gridColumn: "1 / -1" }}>
      <label className="field__label">{question}</label>
      <div className="g1radio">
        {YESNO_OPTIONS.map((o) => (
          <label key={o.value} className={"g1opt" + (value === o.value ? " is-on" : "")}>
            <input type="radio" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.en} / {o.pt}
          </label>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ n, en, pt, children }: { n?: number; en: string; pt: string; children: React.ReactNode }) {
  return (
    <div className="card formcard">
      <h3 className="g1card-title">
        {n != null && <span className="n">{n}</span>}
        {en}
      </h3>
      <div className="g1sub">{pt}</div>
      {children}
    </div>
  );
}

// caminho profundo no objeto de dados
function getIn(obj: unknown, path: (string | number)[]): unknown {
  let cur: unknown = obj;
  for (const k of path) cur = (cur as Record<string, unknown>)[k as string];
  return cur;
}

export function G1Form({ job, defaultEmail }: { job: JobInfo; defaultEmail?: string }) {
  const [data, setData] = useState<G1Data>(() => {
    const d = emptyG1();
    if (defaultEmail) d.additional.email = defaultEmail;
    return d;
  });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  // atualiza um campo em qualquer profundidade
  const set = (path: (string | number)[], value: unknown) =>
    setData((prev) => {
      const next = structuredClone(prev);
      let cur: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i] as string] as Record<string, unknown>;
      cur[path[path.length - 1] as string] = value;
      return next;
    });
  // muta um array em `path`
  const mutArr = (path: (string | number)[], fn: (arr: unknown[]) => void) =>
    setData((prev) => {
      const next = structuredClone(prev);
      fn(getIn(next, path) as unknown[]);
      return next;
    });

  const submit = () => {
    setError(null);
    if (!data.declaration.agreed) {
      setError("É preciso aceitar a Declaração para enviar.");
      return;
    }
    if (!consent) {
      setError("É necessário marcar o consentimento para enviar a aplicação.");
      return;
    }
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
        <h1>Aplicação enviada!</h1>
        <p>
          Recebemos seu formulário G1 para <b>{job.title}</b> ({job.employer}). A equipe da Kick Start
          vai analisar e entrar em contato. Acompanhe em &quot;Meu Processo EB-3&quot;.
        </p>
        <div className="welcome__actions" style={{ marginTop: 28 }}>
          <Link className="btn btn--primary btn--lg" href="/meu-processo">
            <Icon n="route" /> Meu processo
          </Link>
          <Link className="btn btn--ghost btn--lg" href="/vagas">
            <Icon n="briefcase" /> Ver outras vagas
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
        <label className="field__label">Job Details (at least 6) / Descrição do cargo (mínimo 6 detalhes)</label>
        <textarea className="input" style={{ minHeight: 110 }} value={emp.jobDetails} onChange={(e) => set([...base, "jobDetails"], e.target.value)} />
      </div>
    </>
  );

  return (
    <>
      <div className="g1note">
        <Icon n="alert-triangle" />
        <div>
          <b>Please write all contents in CAPITALS</b> · Preencha tudo em MAIÚSCULAS. Datas no formato
          MM/DD/AAAA.
        </div>
      </div>

      {/* 1. PERSONAL */}
      <SectionCard en="Personal Information" pt="Informações Pessoais">
        <div className="formgrid">
          {PERSONAL_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.personal as Record<string, string>)[f.key]} onChange={(v) => set(["personal", f.key], v)} />
          ))}
        </div>
        {data.personal.sex === "OTHER" && (
          <div className="field" style={{ marginTop: 8 }}>
            <label className="field__label">Other / Outro</label>
            <input className="input" value={data.personal.sexOther} onChange={(e) => set(["personal", "sexOther"], e.target.value)} />
          </div>
        )}
        <div className="g1note" style={{ marginTop: 12, marginBottom: 0 }}>
          <Icon n="alert-triangle" />
          <div>US requires legal Civil marriage for Immigration Processes. / Os EUA exigem casamento civil legal para processos de imigração.</div>
        </div>
      </SectionCard>

      {/* CURRENT ADDRESS */}
      <SectionCard en="Current Address" pt="Endereço Atual">
        <div className="formgrid">
          {ADDRESS_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.address as Record<string, string>)[f.key]} onChange={(v) => set(["address", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      {/* EMERGENCY */}
      <SectionCard en="Emergency Contact" pt="Contato de Emergência">
        <div className="formgrid">
          {EMERGENCY_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.emergency as Record<string, string>)[f.key]} onChange={(v) => set(["emergency", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      {/* SOCIAL */}
      <SectionCard en="Social Media Accounts" pt="Redes Sociais">
        <div className="formgrid">{social(data.social, ["social"])}</div>
      </SectionCard>

      {/* EDUCATION */}
      <SectionCard en="Education Information" pt="Informações Educacionais">
        <div className="formgrid">
          {EDUCATION_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.education as Record<string, string>)[f.key]} onChange={(v) => set(["education", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      {/* CURRENT EMPLOYMENT */}
      <SectionCard en="Current Employment (last 3 years)" pt="Emprego Atual (últimos 3 anos)">
        {employmentBlock(data.currentEmployment, ["currentEmployment"])}
      </SectionCard>

      {/* PREVIOUS EMPLOYMENT (repeatable) */}
      <SectionCard en="Previous Employment" pt="Emprego Anterior">
        {data.previousEmployments.map((emp, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__head">
              <span className="g1block__title">#{i + 1}</span>
              {data.previousEmployments.length > 1 && (
                <button type="button" className="iconbtn" onClick={() => mutArr(["previousEmployments"], (a) => a.splice(i, 1))} title="Remover">
                  <Icon n="trash" />
                </button>
              )}
            </div>
            {employmentBlock(emp, ["previousEmployments", i])}
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => mutArr(["previousEmployments"], (a) => a.push(emptyEmployment()))}>
          <Icon n="plus" /> Adicionar emprego anterior
        </button>
      </SectionCard>

      {/* ADDITIONAL — PERSONAL */}
      <SectionCard n={1} en="Additional — Personal Information" pt="Adicionais — Informações Pessoais">
        <div className="formgrid">
          {ADDITIONAL_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.additional as Record<string, string>)[f.key]} onChange={(v) => set(["additional", f.key], v)} />
          ))}
        </div>
      </SectionCard>

      {/* ADDITIONAL — FAMILY */}
      <SectionCard n={2} en="Family Information" pt="Informações Familiares">
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
          <label className="field__label">Address (if different from Principal Applicant) / Endereço (se diferente do requerente)</label>
          <input className="input" value={data.familyAddress} onChange={(e) => set(["familyAddress"], e.target.value)} />
        </div>
      </SectionCard>

      {/* SPOUSE */}
      <SectionCard en="Spouse's Information" pt="Informações do Cônjuge">
        <div className="formgrid">
          {SPOUSE_FIELDS.map((f) => (
            <FieldView key={f.key} meta={f} value={(data.spouse as unknown as Record<string, string>)[f.key]} onChange={(v) => set(["spouse", f.key], v)} />
          ))}
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="field__label">Spouse Job Details (at least 6) / Descrição do cargo do cônjuge (mínimo 6)</label>
          <textarea className="input" style={{ minHeight: 90 }} value={data.spouse.jobDetails} onChange={(e) => set(["spouse", "jobDetails"], e.target.value)} />
        </div>
        <div className="g1block__title" style={{ margin: "14px 0 10px" }}>Spouse Social Media / Redes do Cônjuge</div>
        <div className="formgrid">{social(data.spouse.social, ["spouse", "social"])}</div>
      </SectionCard>

      {/* 3. US ENTRY HISTORY */}
      <SectionCard n={3} en="U.S. Entry History" pt="Histórico de Entradas nos EUA">
        <YesNo question="Have you ever been / are you currently in the U.S.? / Você já esteve ou está atualmente nos EUA?" value={data.usEntry.everInUs} onChange={(v) => set(["usEntry", "everInUs"], v)} />
        {data.usEntry.people.map((p, pi) => (
          <div className="g1block" key={pi}>
            <div className="g1block__title" style={{ marginBottom: 12 }}>{p.name}</div>
            <div className="formgrid">
              <div className="field">
                <label className="field__label">Name / Nome</label>
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
              <Icon n="plus" /> Adicionar entrada
            </button>
          </div>
        ))}
      </SectionCard>

      {/* 4. VISA STATUS & COMPLIANCE */}
      <SectionCard n={4} en="Visa Status & Compliance" pt="Status de Visto e Conformidade">
        <div className="formgrid">
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field__label">Current Visa / Immigration status / Status atual de visto ou imigração</label>
            <input className="input" value={data.visaCompliance.currentStatus} onChange={(e) => set(["visaCompliance", "currentStatus"], e.target.value)} />
          </div>
        </div>
        <YesNo question="Have you ever violated your visa terms? / Você já violou os termos do seu visto?" value={data.visaCompliance.violatedTerms} onChange={(v) => set(["visaCompliance", "violatedTerms"], v)} />
        {data.visaCompliance.violatedTerms === "YES" && (
          <textarea className="input" style={{ minHeight: 70, marginBottom: 12 }} placeholder="Detalhes / Details" value={data.visaCompliance.violatedDetails} onChange={(e) => set(["visaCompliance", "violatedDetails"], e.target.value)} />
        )}
        <YesNo question="Have you ever been arrested anywhere? / Você já foi preso(a) em algum lugar?" value={data.visaCompliance.arrested} onChange={(v) => set(["visaCompliance", "arrested"], v)} />
        {data.visaCompliance.arrested === "YES" && (
          <textarea className="input" style={{ minHeight: 70, marginBottom: 12 }} placeholder="Detalhes / Details" value={data.visaCompliance.arrestedDetails} onChange={(e) => set(["visaCompliance", "arrestedDetails"], e.target.value)} />
        )}
        <YesNo question="Have you/family ever stayed in the U.S. over 6 months? / Você ou familiar já ficou nos EUA por mais de 6 meses?" value={data.visaCompliance.stayedOver6m} onChange={(v) => set(["visaCompliance", "stayedOver6m"], v)} />
        {data.visaCompliance.stayedOver6m === "YES" && (
          <textarea className="input" style={{ minHeight: 70 }} placeholder="Detalhes / Details" value={data.visaCompliance.stayedDetails} onChange={(e) => set(["visaCompliance", "stayedDetails"], e.target.value)} />
        )}
      </SectionCard>

      {/* 5. SSN & ALIEN NUMBER */}
      <SectionCard n={5} en="SSN & Alien Registration Number" pt="SSN e Número de Registro de Estrangeiro">
        {data.ssn.map((row, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__head">
              <span className="g1block__title">#{i + 1}</span>
              {data.ssn.length > 1 && (
                <button type="button" className="iconbtn" onClick={() => mutArr(["ssn"], (a) => a.splice(i, 1))} title="Remover"><Icon n="trash" /></button>
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
          <Icon n="plus" /> Adicionar linha
        </button>
      </SectionCard>

      {/* 6. GREEN CARD HISTORY */}
      <SectionCard n={6} en="Green Card Application History" pt="Histórico de Pedido de Green Card">
        <div className="field">
          <label className="field__label">Describe in detail / Descreva em detalhes</label>
          <textarea className="input" style={{ minHeight: 90 }} value={data.greenCard.history} onChange={(e) => set(["greenCard", "history"], e.target.value)} />
        </div>
        <YesNo question="Have your children ever received Medicare in the U.S.? / Seus filhos já receberam Medicare nos EUA?" value={data.greenCard.childrenMedicare} onChange={(v) => set(["greenCard", "childrenMedicare"], v)} />
      </SectionCard>

      {/* 7. MEDICAL / CRIMINAL */}
      <SectionCard n={7} en="Medical, Criminal Record & Immigration History" pt="Histórico Médico, Criminal e de Imigração">
        <YesNo question="Criminal record (applicant and/or spouse)? / Antecedentes criminais (requerente e/ou cônjuge)?" value={data.medical.criminalRecord} onChange={(v) => set(["medical", "criminalRecord"], v)} />
        <YesNo question="Committed violations (DUI, assault, robbery, etc.)? / Cometeu infrações (DUI, agressão, roubo, etc.)?" value={data.medical.violations} onChange={(v) => set(["medical", "violations"], v)} />
        {data.medical.violations === "YES" && (
          <div className="formgrid" style={{ marginBottom: 12 }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="field__label">Details / Detalhes</label>
              <textarea className="input" style={{ minHeight: 70 }} value={data.medical.violationsDetails} onChange={(e) => set(["medical", "violationsDetails"], e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Total impaired driving / Total de infrações de trânsito</label>
              <input className="input" value={data.medical.impairedDrivingCount} onChange={(e) => set(["medical", "impairedDrivingCount"], e.target.value)} />
            </div>
          </div>
        )}
        <YesNo question="TB (Tuberculosis) / Tuberculose" value={data.medical.tb} onChange={(v) => set(["medical", "tb"], v)} />
        <YesNo question="Hepatitis / Hepatite" value={data.medical.hepatitis} onChange={(v) => set(["medical", "hepatitis"], v)} />
        <YesNo question="HIV" value={data.medical.hiv} onChange={(v) => set(["medical", "hiv"], v)} />
        <YesNo question="Any other medical conditions? / Outras condições médicas?" value={data.medical.otherConditions} onChange={(v) => set(["medical", "otherConditions"], v)} />
        {data.medical.otherConditions === "YES" && (
          <textarea className="input" style={{ minHeight: 70 }} placeholder="Details / Detalhes" value={data.medical.otherDetails} onChange={(e) => set(["medical", "otherDetails"], e.target.value)} />
        )}
      </SectionCard>

      {/* 8. COUNTRIES LIVED */}
      <SectionCard n={8} en="Countries Lived In (other than birth country)" pt="Países onde Residiu (além do país de nascimento)">
        <YesNo question="Lived in another country >1 consecutive year after age 18? / Viveu em outro país por mais de 1 ano consecutivo após os 18 anos?" value={data.countriesLived.livedAbroad} onChange={(v) => set(["countriesLived", "livedAbroad"], v)} />
        <div className="g1note"><Icon n="alert-triangle" /><div>A Police Clearance Letter will be required for each country listed. / Será exigida certidão de antecedentes para cada país listado.</div></div>
        {data.countriesLived.rows.map((row, i) => (
          <div className="g1block" key={i}>
            <div className="g1block__head">
              <span className="g1block__title">#{i + 1}</span>
              {data.countriesLived.rows.length > 1 && (
                <button type="button" className="iconbtn" onClick={() => mutArr(["countriesLived", "rows"], (a) => a.splice(i, 1))} title="Remover"><Icon n="trash" /></button>
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
          <Icon n="plus" /> Adicionar país
        </button>
      </SectionCard>

      {/* IMPORTANT QUESTIONS */}
      <SectionCard en="Important Questions" pt="Perguntas Importantes">
        {IMPORTANT_QUESTIONS.map((q) => (
          <YesNo
            key={q.key}
            question={`${q.en} / ${q.pt}`}
            value={data.importantQuestions[q.key]}
            onChange={(v) => set(["importantQuestions", q.key], v)}
          />
        ))}
      </SectionCard>

      {/* DECLARATION */}
      <SectionCard en="Declaration" pt="Declaração">
        <ol className="g1clauses">
          {DECLARATION_CLAUSES.map((c, i) => (
            <li key={i}>
              <span>
                {c.en}
                <span className="pt">{c.pt}</span>
              </span>
            </li>
          ))}
        </ol>
        <label className={"consent" + (data.declaration.agreed ? " is-checked" : "")} style={{ marginTop: 16 }}>
          <input type="checkbox" checked={data.declaration.agreed} onChange={(e) => set(["declaration", "agreed"], e.target.checked)} />
          <span>I have read and agree with the Declaration above. / Li e concordo com a Declaração acima.</span>
        </label>
        <div className="formgrid" style={{ marginTop: 12 }}>
          <div className="field">
            <label className="field__label">Applicant Signature (full name) / Assinatura (nome completo)</label>
            <input className="input" value={data.declaration.signature} onChange={(e) => set(["declaration", "signature"], e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Date (MM/DD/YYYY) / Data</label>
            <input className="input" value={data.declaration.date} onChange={(e) => set(["declaration", "date"], e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* AVISO + CONSENTIMENTO (obrigatório) */}
      <div className="notice">
        <Icon n="alert-triangle" />
        <div>
          <div className="notice__t">ATENÇÃO!</div>
          <p>{CONSENT_NOTICE.replace("ATENÇÃO! ", "")}</p>
        </div>
      </div>
      <label className={"consent" + (consent ? " is-checked" : "")}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{CONSENT_CHECKBOX}</span>
      </label>

      {error && (
        <div className="formmsg formmsg--error">
          <Icon n="alert-triangle" /> {error}
        </div>
      )}

      <div className="formactions">
        <button className="btn btn--primary btn--lg" type="button" onClick={submit} disabled={pending || !consent || !data.declaration.agreed}>
          <Icon n="send" /> {pending ? "Enviando…" : "Enviar aplicação"}
        </button>
        <Link className="btn btn--quiet" href={`/vagas/${job.id}`}>
          Cancelar
        </Link>
      </div>
    </>
  );
}
