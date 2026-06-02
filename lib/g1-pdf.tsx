// Gera o PDF do formulário G1 preenchido (anexado no e-mail e baixável no admin).
// O idioma (pt/en) acompanha a escolha do usuário.
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import {
  type FieldMeta, type G1Data, type Employment, type Opt,
  PERSONAL_FIELDS, ADDRESS_FIELDS, EMERGENCY_FIELDS, SOCIAL_FIELDS, EDUCATION_FIELDS,
  EMPLOYMENT_FIELDS, ADDITIONAL_FIELDS, FAMILY_COLUMNS, SPOUSE_FIELDS, SSN_COLUMNS,
  COUNTRY_COLUMNS, IMPORTANT_QUESTIONS, DECLARATION_CLAUSES,
} from "@/lib/g1";

type Lang = "pt" | "en";
const BRAND = "#730027";

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 40, paddingHorizontal: 36, fontSize: 8.5, color: "#181b24", fontFamily: "Helvetica" },
  header: { backgroundColor: BRAND, color: "#fff", padding: 10, borderRadius: 4, marginBottom: 14 },
  hTitle: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  hSub: { fontSize: 8, color: "#f0d6df", marginTop: 2 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 12 },
  metaItem: { fontSize: 8, color: "#545c6e", marginRight: 14 },
  sectionTitle: { backgroundColor: "#f0f2f6", color: "#181b24", fontFamily: "Helvetica-Bold", fontSize: 9.5, paddingVertical: 4, paddingHorizontal: 6, marginTop: 12, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: BRAND },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e7e9f0", paddingVertical: 2.5 },
  label: { width: "46%", color: "#6b7280", paddingRight: 8 },
  value: { width: "54%", color: "#181b24", fontFamily: "Helvetica-Bold" },
  blockTitle: { fontFamily: "Helvetica-Bold", fontSize: 8.5, marginTop: 8, marginBottom: 2, color: BRAND },
  clause: { flexDirection: "row", marginBottom: 4 },
  clauseN: { width: 12, fontFamily: "Helvetica-Bold", color: BRAND },
  para: { lineHeight: 1.4, color: "#374151" },
  sign: { flexDirection: "row", marginTop: 10, gap: 20 },
});

// Títulos de seção por idioma (mesmos textos do app).
const SECTIONS: Record<string, { pt: string; en: string }> = {
  personal: { pt: "Informações Pessoais", en: "Personal Information" },
  address: { pt: "Endereço Atual", en: "Current Address" },
  emergency: { pt: "Contato de Emergência", en: "Emergency Contact" },
  social: { pt: "Redes Sociais", en: "Social Media Accounts" },
  education: { pt: "Informações Educacionais", en: "Education Information" },
  currentEmp: { pt: "Emprego Atual (últimos 3 anos)", en: "Current Employment (last 3 years)" },
  prevEmp: { pt: "Emprego Anterior", en: "Previous Employment" },
  addPersonal: { pt: "Adicionais — Informações Pessoais", en: "Additional — Personal Information" },
  family: { pt: "Informações Familiares", en: "Family Information" },
  spouse: { pt: "Informações do Cônjuge", en: "Spouse's Information" },
  usEntry: { pt: "Histórico de Entradas nos EUA", en: "U.S. Entry History" },
  visa: { pt: "Status de Visto e Conformidade", en: "Visa Status & Compliance" },
  ssn: { pt: "SSN e Número de Registro de Estrangeiro", en: "SSN & Alien Registration Number" },
  greenCard: { pt: "Histórico de Pedido de Green Card", en: "Green Card Application History" },
  medical: { pt: "Histórico Médico, Criminal e de Imigração", en: "Medical, Criminal Record & Immigration History" },
  countries: { pt: "Países onde Residiu", en: "Countries Lived In" },
  important: { pt: "Perguntas Importantes", en: "Important Questions" },
  declaration: { pt: "Declaração", en: "Declaration" },
};

const LBL: Record<string, { pt: string; en: string }> = {
  jobDetails: { pt: "Descrição do cargo", en: "Job details" },
  familyAddress: { pt: "Endereço da família", en: "Family address" },
  spouseJobDetails: { pt: "Descrição do cargo do cônjuge", en: "Spouse job details" },
  spouseSocial: { pt: "Redes do Cônjuge", en: "Spouse Social Media" },
  everInUs: { pt: "Já esteve ou está nos EUA?", en: "Ever been / currently in the U.S.?" },
  currentVisa: { pt: "Status atual de visto/imigração", en: "Current visa / immigration status" },
  violatedTerms: { pt: "Violou termos do visto?", en: "Violated visa terms?" },
  arrested: { pt: "Já foi preso(a)?", en: "Ever arrested?" },
  stayedOver6m: { pt: "Ficou >6 meses nos EUA?", en: "Stayed >6 months in U.S.?" },
  details: { pt: "Detalhes", en: "Details" },
  gcHistory: { pt: "Descrição", en: "Description" },
  childrenMedicare: { pt: "Filhos receberam Medicare?", en: "Children received Medicare?" },
  criminalRecord: { pt: "Antecedentes criminais?", en: "Criminal record?" },
  violations: { pt: "Cometeu infrações?", en: "Committed violations?" },
  impaired: { pt: "Total infrações de trânsito", en: "Impaired driving count" },
  tb: { pt: "Tuberculose", en: "TB (Tuberculosis)" },
  hepatitis: { pt: "Hepatite", en: "Hepatitis" },
  hiv: { pt: "HIV", en: "HIV" },
  otherConditions: { pt: "Outras condições médicas?", en: "Other medical conditions?" },
  livedAbroad: { pt: "Viveu fora >1 ano após os 18?", en: "Lived abroad >1yr after 18?" },
  other: { pt: "Outro", en: "Other" },
  declStatus: { pt: "Declaração", en: "Declaration" },
  accepted: { pt: "ACEITO", en: "ACCEPTED" },
  notAccepted: { pt: "NÃO ACEITO", en: "NOT ACCEPTED" },
  signature: { pt: "Assinatura", en: "Signature" },
  date: { pt: "Data", en: "Date" },
  entry: { pt: "Entrada", en: "Entry" },
};

function L(f: { pt: string; en: string }, lang: Lang) {
  return lang === "en" ? f.en : f.pt;
}
function optLabel(options: Opt[], value: string, lang: Lang) {
  const o = options.find((x) => x.value === value);
  return o ? (lang === "en" ? o.en : o.pt) : "—";
}
function val(meta: FieldMeta, obj: Record<string, unknown>, lang: Lang): string {
  const raw = (obj?.[meta.key] ?? "") as string;
  if (meta.options) return raw ? optLabel(meta.options, raw, lang) : "—";
  return raw ? String(raw) : "—";
}
function yn(v: string, lang: Lang) {
  if (v === "YES") return lang === "en" ? "Yes" : "Sim";
  if (v === "NO") return lang === "en" ? "No" : "Não";
  return "—";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value || "—"}</Text>
    </View>
  );
}
function Fields({ fields, obj, lang }: { fields: FieldMeta[]; obj: Record<string, unknown>; lang: Lang }) {
  return (
    <>
      {fields.map((f) => (
        <Row key={f.key} label={L(f, lang)} value={val(f, obj, lang)} />
      ))}
    </>
  );
}
function Title({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}
function EmploymentView({ emp, lang }: { emp: Employment; lang: Lang }) {
  return (
    <>
      <Fields fields={EMPLOYMENT_FIELDS} obj={emp as unknown as Record<string, unknown>} lang={lang} />
      <Row label={LBL.jobDetails[lang]} value={emp.jobDetails} />
    </>
  );
}

export type G1PdfMeta = {
  jobTitle: string;
  jobEmployer: string;
  jobVisa: string;
  applicantName: string;
  applicantEmail: string;
  submittedAt: Date;
  lang?: Lang;
};

function G1Doc({ data, meta }: { data: G1Data; meta: G1PdfMeta }) {
  const lang: Lang = meta.lang ?? "pt";
  const sec = (k: string) => SECTIONS[k][lang];
  const dt = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "pt-BR", {
    dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo",
  }).format(meta.submittedAt);

  return (
    <Document title={`G1 Form — ${meta.applicantName}`}>
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}>
          <Text style={s.hTitle}>G1 FORM — APPLICANT INTAKE FORM</Text>
          <Text style={s.hSub}>Kick Start Agency</Text>
        </View>
        <View style={s.meta}>
          <Text style={s.metaItem}>{meta.jobTitle} — {meta.jobEmployer} ({meta.jobVisa})</Text>
          <Text style={s.metaItem}>{meta.applicantName} · {meta.applicantEmail}</Text>
          <Text style={s.metaItem}>{dt}</Text>
        </View>

        <Title>{sec("personal")}</Title>
        <Fields fields={PERSONAL_FIELDS} obj={data.personal as unknown as Record<string, unknown>} lang={lang} />
        {data.personal.sex === "OTHER" && <Row label={LBL.other[lang]} value={data.personal.sexOther} />}

        <Title>{sec("address")}</Title>
        <Fields fields={ADDRESS_FIELDS} obj={data.address as unknown as Record<string, unknown>} lang={lang} />

        <Title>{sec("emergency")}</Title>
        <Fields fields={EMERGENCY_FIELDS} obj={data.emergency as unknown as Record<string, unknown>} lang={lang} />

        <Title>{sec("social")}</Title>
        <Fields fields={SOCIAL_FIELDS} obj={data.social as unknown as Record<string, unknown>} lang={lang} />

        <Title>{sec("education")}</Title>
        <Fields fields={EDUCATION_FIELDS} obj={data.education as unknown as Record<string, unknown>} lang={lang} />

        <Title>{sec("currentEmp")}</Title>
        <EmploymentView emp={data.currentEmployment} lang={lang} />

        <Title>{sec("prevEmp")}</Title>
        {data.previousEmployments.map((emp, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>#{i + 1}</Text>
            <EmploymentView emp={emp} lang={lang} />
          </View>
        ))}

        <Title>{sec("addPersonal")}</Title>
        <Fields fields={ADDITIONAL_FIELDS} obj={data.additional as unknown as Record<string, unknown>} lang={lang} />

        <Title>{sec("family")}</Title>
        {data.family.map((m, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>{m.relationship}</Text>
            <Fields fields={FAMILY_COLUMNS} obj={m as unknown as Record<string, unknown>} lang={lang} />
          </View>
        ))}
        <Row label={LBL.familyAddress[lang]} value={data.familyAddress} />

        <Title>{sec("spouse")}</Title>
        <Fields fields={SPOUSE_FIELDS} obj={data.spouse as unknown as Record<string, unknown>} lang={lang} />
        <Row label={LBL.spouseJobDetails[lang]} value={data.spouse.jobDetails} />
        <Text style={s.blockTitle}>{LBL.spouseSocial[lang]}</Text>
        <Fields fields={SOCIAL_FIELDS} obj={data.spouse.social as unknown as Record<string, unknown>} lang={lang} />

        <Title>{sec("usEntry")}</Title>
        <Row label={LBL.everInUs[lang]} value={yn(data.usEntry.everInUs, lang)} />
        {data.usEntry.people.map((p, pi) => (
          <View key={pi}>
            <Text style={s.blockTitle}>{p.name} · I-94 #: {p.i94 || "—"}</Text>
            {p.entries.map((en, ei) => (
              <Row key={ei} label={`${LBL.entry[lang]} #${ei + 1}`} value={`${en.date || "—"} · ${en.port || "—"} · ${en.visaType || "—"}`} />
            ))}
          </View>
        ))}

        <Title>{sec("visa")}</Title>
        <Row label={LBL.currentVisa[lang]} value={data.visaCompliance.currentStatus} />
        <Row label={LBL.violatedTerms[lang]} value={yn(data.visaCompliance.violatedTerms, lang)} />
        {data.visaCompliance.violatedTerms === "YES" && <Row label={LBL.details[lang]} value={data.visaCompliance.violatedDetails} />}
        <Row label={LBL.arrested[lang]} value={yn(data.visaCompliance.arrested, lang)} />
        {data.visaCompliance.arrested === "YES" && <Row label={LBL.details[lang]} value={data.visaCompliance.arrestedDetails} />}
        <Row label={LBL.stayedOver6m[lang]} value={yn(data.visaCompliance.stayedOver6m, lang)} />
        {data.visaCompliance.stayedOver6m === "YES" && <Row label={LBL.details[lang]} value={data.visaCompliance.stayedDetails} />}

        <Title>{sec("ssn")}</Title>
        {data.ssn.map((r, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>#{i + 1}</Text>
            <Fields fields={SSN_COLUMNS} obj={r as unknown as Record<string, unknown>} lang={lang} />
          </View>
        ))}

        <Title>{sec("greenCard")}</Title>
        <Row label={LBL.gcHistory[lang]} value={data.greenCard.history} />
        <Row label={LBL.childrenMedicare[lang]} value={yn(data.greenCard.childrenMedicare, lang)} />

        <Title>{sec("medical")}</Title>
        <Row label={LBL.criminalRecord[lang]} value={yn(data.medical.criminalRecord, lang)} />
        <Row label={LBL.violations[lang]} value={yn(data.medical.violations, lang)} />
        {data.medical.violations === "YES" && <Row label={LBL.details[lang]} value={data.medical.violationsDetails} />}
        {data.medical.violations === "YES" && <Row label={LBL.impaired[lang]} value={data.medical.impairedDrivingCount} />}
        <Row label={LBL.tb[lang]} value={yn(data.medical.tb, lang)} />
        <Row label={LBL.hepatitis[lang]} value={yn(data.medical.hepatitis, lang)} />
        <Row label={LBL.hiv[lang]} value={yn(data.medical.hiv, lang)} />
        <Row label={LBL.otherConditions[lang]} value={yn(data.medical.otherConditions, lang)} />
        {data.medical.otherConditions === "YES" && <Row label={LBL.details[lang]} value={data.medical.otherDetails} />}

        <Title>{sec("countries")}</Title>
        <Row label={LBL.livedAbroad[lang]} value={yn(data.countriesLived.livedAbroad, lang)} />
        {data.countriesLived.rows.map((r, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>#{i + 1}</Text>
            <Fields fields={COUNTRY_COLUMNS} obj={r as unknown as Record<string, unknown>} lang={lang} />
          </View>
        ))}

        <Title>{sec("important")}</Title>
        {IMPORTANT_QUESTIONS.map((q) => (
          <Row key={q.key} label={lang === "en" ? q.en : q.pt} value={yn(data.importantQuestions[q.key], lang)} />
        ))}

        <Title>{sec("declaration")}</Title>
        {DECLARATION_CLAUSES.map((c, i) => (
          <View key={i} style={s.clause}>
            <Text style={s.clauseN}>{i + 1}.</Text>
            <Text style={s.para}>{lang === "en" ? c.en : c.pt}</Text>
          </View>
        ))}
        <Text style={{ marginTop: 6, fontFamily: "Helvetica-Bold", color: data.declaration.agreed ? "#1f9254" : "#cf2c20" }}>
          {data.declaration.agreed ? LBL.accepted[lang] : LBL.notAccepted[lang]}
        </Text>
        <View style={s.sign}>
          <Text>{LBL.signature[lang]}: {data.declaration.signature || "—"}</Text>
          <Text>{LBL.date[lang]}: {data.declaration.date || "—"}</Text>
        </View>

        <Text style={{ marginTop: 16, fontSize: 7, color: "#9aa1b1", textAlign: "center" }}>
          KICK START AGENCY · Connecting Talent with Opportunity · G1 Form 2026
        </Text>
      </Page>
    </Document>
  );
}

// Renderiza o PDF e devolve um Buffer (para anexar no e-mail ou servir no admin).
export async function renderG1Pdf(data: G1Data, meta: G1PdfMeta): Promise<Buffer> {
  return renderToBuffer(<G1Doc data={data} meta={meta} />);
}
