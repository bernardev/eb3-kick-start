// Gera o PDF do formulário G1 preenchido (anexado no e-mail e baixável no admin).
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import {
  bi, optLabel,
  PERSONAL_FIELDS, ADDRESS_FIELDS, EMERGENCY_FIELDS, SOCIAL_FIELDS, EDUCATION_FIELDS,
  EMPLOYMENT_FIELDS, ADDITIONAL_FIELDS, FAMILY_COLUMNS, SPOUSE_FIELDS, SSN_COLUMNS,
  COUNTRY_COLUMNS, ENTRY_COLUMNS, IMPORTANT_QUESTIONS, DECLARATION_CLAUSES,
  type FieldMeta, type G1Data, type Employment,
} from "@/lib/g1";

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

function val(meta: FieldMeta, obj: Record<string, unknown>): string {
  const raw = (obj?.[meta.key] ?? "") as string;
  if (meta.options) return raw ? optLabel(meta.options, raw) : "—";
  return raw ? String(raw) : "—";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value || "—"}</Text>
    </View>
  );
}

function Fields({ fields, obj }: { fields: FieldMeta[]; obj: Record<string, unknown> }) {
  return (
    <>
      {fields.map((f) => (
        <Row key={f.key} label={bi(f)} value={val(f, obj)} />
      ))}
    </>
  );
}

function Title({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

function yn(v: string) {
  return v === "YES" ? "YES / SIM" : v === "NO" ? "NO / NÃO" : "—";
}

function EmploymentView({ emp }: { emp: Employment }) {
  return (
    <>
      <Fields fields={EMPLOYMENT_FIELDS} obj={emp as unknown as Record<string, unknown>} />
      <Row label="Job Details / Descrição do cargo" value={emp.jobDetails} />
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
};

function G1Doc({ data, meta }: { data: G1Data; meta: G1PdfMeta }) {
  const dt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(meta.submittedAt);
  return (
    <Document title={`G1 Form — ${meta.applicantName}`}>
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}>
          <Text style={s.hTitle}>G1 FORM — APPLICANT INTAKE FORM</Text>
          <Text style={s.hSub}>Formulário de Cadastro do Candidato · Kick Start Agency</Text>
        </View>
        <View style={s.meta}>
          <Text style={s.metaItem}>Vaga: {meta.jobTitle} — {meta.jobEmployer} ({meta.jobVisa})</Text>
          <Text style={s.metaItem}>Candidato: {meta.applicantName} · {meta.applicantEmail}</Text>
          <Text style={s.metaItem}>Enviado: {dt}</Text>
        </View>

        <Title>Personal Information / Informações Pessoais</Title>
        <Fields fields={PERSONAL_FIELDS} obj={data.personal as unknown as Record<string, unknown>} />
        {data.personal.sex === "OTHER" && <Row label="Other / Outro" value={data.personal.sexOther} />}

        <Title>Current Address / Endereço Atual</Title>
        <Fields fields={ADDRESS_FIELDS} obj={data.address as unknown as Record<string, unknown>} />

        <Title>Emergency Contact / Contato de Emergência</Title>
        <Fields fields={EMERGENCY_FIELDS} obj={data.emergency as unknown as Record<string, unknown>} />

        <Title>Social Media / Redes Sociais</Title>
        <Fields fields={SOCIAL_FIELDS} obj={data.social as unknown as Record<string, unknown>} />

        <Title>Education / Educação</Title>
        <Fields fields={EDUCATION_FIELDS} obj={data.education as unknown as Record<string, unknown>} />

        <Title>Current Employment / Emprego Atual</Title>
        <EmploymentView emp={data.currentEmployment} />

        <Title>Previous Employment / Emprego Anterior</Title>
        {data.previousEmployments.map((emp, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>#{i + 1}</Text>
            <EmploymentView emp={emp} />
          </View>
        ))}

        <Title>Additional — Personal / Adicionais — Pessoais</Title>
        <Fields fields={ADDITIONAL_FIELDS} obj={data.additional as unknown as Record<string, unknown>} />

        <Title>Family Information / Informações Familiares</Title>
        {data.family.map((m, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>{m.relationship}</Text>
            <Fields fields={FAMILY_COLUMNS} obj={m as unknown as Record<string, unknown>} />
          </View>
        ))}
        <Row label="Family address / Endereço da família" value={data.familyAddress} />

        <Title>Spouse's Information / Informações do Cônjuge</Title>
        <Fields fields={SPOUSE_FIELDS} obj={data.spouse as unknown as Record<string, unknown>} />
        <Row label="Spouse Job Details / Descrição do cargo do cônjuge" value={data.spouse.jobDetails} />
        <Text style={s.blockTitle}>Spouse Social Media / Redes do Cônjuge</Text>
        <Fields fields={SOCIAL_FIELDS} obj={data.spouse.social as unknown as Record<string, unknown>} />

        <Title>U.S. Entry History / Histórico de Entradas nos EUA</Title>
        <Row label="Ever been / currently in the U.S.? / Já esteve ou está nos EUA?" value={yn(data.usEntry.everInUs)} />
        {data.usEntry.people.map((p, pi) => (
          <View key={pi}>
            <Text style={s.blockTitle}>{p.name} · I-94 #: {p.i94 || "—"}</Text>
            {p.entries.map((en, ei) => (
              <Row key={ei} label={`Entry #${ei + 1}`} value={`${en.date || "—"} · ${en.port || "—"} · ${en.visaType || "—"}`} />
            ))}
          </View>
        ))}

        <Title>Visa Status & Compliance / Status de Visto e Conformidade</Title>
        <Row label="Current visa / immigration status" value={data.visaCompliance.currentStatus} />
        <Row label="Violated visa terms? / Violou termos do visto?" value={yn(data.visaCompliance.violatedTerms)} />
        {data.visaCompliance.violatedTerms === "YES" && <Row label="Details / Detalhes" value={data.visaCompliance.violatedDetails} />}
        <Row label="Ever arrested? / Já foi preso(a)?" value={yn(data.visaCompliance.arrested)} />
        {data.visaCompliance.arrested === "YES" && <Row label="Details / Detalhes" value={data.visaCompliance.arrestedDetails} />}
        <Row label="Stayed >6 months in U.S.? / Ficou >6 meses nos EUA?" value={yn(data.visaCompliance.stayedOver6m)} />
        {data.visaCompliance.stayedOver6m === "YES" && <Row label="Details / Detalhes" value={data.visaCompliance.stayedDetails} />}

        <Title>SSN & Alien Number / SSN e Nº de Estrangeiro</Title>
        {data.ssn.map((r, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>#{i + 1}</Text>
            <Fields fields={SSN_COLUMNS} obj={r as unknown as Record<string, unknown>} />
          </View>
        ))}

        <Title>Green Card Application History / Histórico de Green Card</Title>
        <Row label="Description / Descrição" value={data.greenCard.history} />
        <Row label="Children received Medicare? / Filhos receberam Medicare?" value={yn(data.greenCard.childrenMedicare)} />

        <Title>Medical, Criminal & Immigration / Médico, Criminal e Imigração</Title>
        <Row label="Criminal record? / Antecedentes criminais?" value={yn(data.medical.criminalRecord)} />
        <Row label="Committed violations? / Cometeu infrações?" value={yn(data.medical.violations)} />
        {data.medical.violations === "YES" && <Row label="Details / Detalhes" value={data.medical.violationsDetails} />}
        {data.medical.violations === "YES" && <Row label="Impaired driving count / Total infrações trânsito" value={data.medical.impairedDrivingCount} />}
        <Row label="TB / Tuberculose" value={yn(data.medical.tb)} />
        <Row label="Hepatitis / Hepatite" value={yn(data.medical.hepatitis)} />
        <Row label="HIV" value={yn(data.medical.hiv)} />
        <Row label="Other medical conditions? / Outras condições?" value={yn(data.medical.otherConditions)} />
        {data.medical.otherConditions === "YES" && <Row label="Details / Detalhes" value={data.medical.otherDetails} />}

        <Title>Countries Lived In / Países onde Residiu</Title>
        <Row label="Lived abroad >1yr after 18? / Viveu fora >1 ano após os 18?" value={yn(data.countriesLived.livedAbroad)} />
        {data.countriesLived.rows.map((r, i) => (
          <View key={i}>
            <Text style={s.blockTitle}>#{i + 1}</Text>
            <Fields fields={COUNTRY_COLUMNS} obj={r as unknown as Record<string, unknown>} />
          </View>
        ))}

        <Title>Important Questions / Perguntas Importantes</Title>
        {IMPORTANT_QUESTIONS.map((q) => (
          <Row key={q.key} label={`${q.en} / ${q.pt}`} value={yn(data.importantQuestions[q.key])} />
        ))}

        <Title>Declaration / Declaração</Title>
        {DECLARATION_CLAUSES.map((c, i) => (
          <View key={i} style={s.clause}>
            <Text style={s.clauseN}>{i + 1}.</Text>
            <Text style={s.para}>{c.en} — {c.pt}</Text>
          </View>
        ))}
        <Text style={{ marginTop: 6, fontFamily: "Helvetica-Bold", color: data.declaration.agreed ? "#1f9254" : "#cf2c20" }}>
          {data.declaration.agreed ? "ACCEPTED / ACEITO" : "NOT ACCEPTED / NÃO ACEITO"}
        </Text>
        <View style={s.sign}>
          <Text>Signature / Assinatura: {data.declaration.signature || "—"}</Text>
          <Text>Date / Data: {data.declaration.date || "—"}</Text>
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
