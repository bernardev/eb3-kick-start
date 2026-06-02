import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "./Icon";
import { MARITAL_OPTIONS, EDUCATION_OPTIONS, type Opt, type G1Data } from "@/lib/g1";

type LegacyAnswer = { label: string; answer: string };

function isG1(a: unknown): a is G1Data {
  return !!a && typeof a === "object" && !Array.isArray(a) && "personal" in (a as object);
}

function Row({ q, a }: { q: string; a: string }) {
  return (
    <div className="answer">
      <div className="answer__q">{q}</div>
      <div className="answer__a">{a || "—"}</div>
    </div>
  );
}

// Renderiza as respostas de uma aplicação. Para o formato G1, mostra um
// resumo (no idioma atual) + botão para baixar o PDF completo. Mantém
// compatibilidade com aplicações antigas (lista pergunta/resposta).
export async function AnswersBlock({ appId, answers }: { appId: string; answers: unknown }) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const en = locale === "en";
  const optL = (options: Opt[], value: string) => {
    const o = options.find((x) => x.value === value);
    return o ? (en ? o.en : o.pt) : "—";
  };

  if (isG1(answers)) {
    const d = answers;
    const name = `${d.personal.firstName ?? ""} ${d.personal.lastName ?? ""}`.trim() || "—";
    const summary: { q: string; a: string }[] = [
      { q: en ? "Name" : "Nome", a: name },
      { q: en ? "Date of birth" : "Data de nascimento", a: d.address.dob },
      { q: "E-mail", a: d.additional.email },
      { q: en ? "Phone" : "Telefone", a: d.address.phone },
      { q: en ? "Marital status" : "Estado civil", a: optL(MARITAL_OPTIONS, d.personal.maritalStatus) },
      { q: en ? "Education" : "Educação", a: optL(EDUCATION_OPTIONS, d.education.level) },
      { q: en ? "Current employer" : "Empregador atual", a: `${d.currentEmployment.employer} ${d.currentEmployment.jobTitle}`.trim() },
      { q: en ? "Citizenship" : "Cidadania", a: d.address.citizenship },
      { q: en ? "Declaration" : "Declaração", a: d.declaration.agreed ? (en ? "Accepted" : "Aceita") : (en ? "Not accepted" : "Não aceita") },
    ];
    return (
      <div>
        <div style={{ marginBottom: 14 }}>
          <a className="btn btn--ghost btn--sm" href={`/api/applications/${appId}/pdf`} target="_blank" rel="noopener noreferrer">
            <Icon n="file-text" /> {t("downloadPdf")}
          </a>
        </div>
        <div className="kicker" style={{ marginBottom: 8 }}>{t("summary")}</div>
        {summary.map((r, i) => (
          <Row key={i} q={r.q} a={r.a} />
        ))}
      </div>
    );
  }

  const items = (Array.isArray(answers) ? answers : []) as LegacyAnswer[];
  return (
    <div>
      {items.map((a, i) => (
        <Row key={i} q={a.label} a={a.answer} />
      ))}
    </div>
  );
}
