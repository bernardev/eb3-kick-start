import { Icon } from "./Icon";
import { optLabel, MARITAL_OPTIONS, EDUCATION_OPTIONS, type G1Data } from "@/lib/g1";

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
// resumo + botão para baixar o PDF completo. Mantém compatibilidade com
// aplicações antigas (lista de pergunta/resposta).
export function AnswersBlock({ appId, answers }: { appId: string; answers: unknown }) {
  if (isG1(answers)) {
    const d = answers;
    const name = `${d.personal.firstName ?? ""} ${d.personal.lastName ?? ""}`.trim() || "—";
    const summary: { q: string; a: string }[] = [
      { q: "Nome / Name", a: name },
      { q: "Data de nascimento / DOB", a: d.address.dob },
      { q: "E-mail (G1)", a: d.additional.email },
      { q: "Telefone / Phone", a: d.address.phone },
      { q: "Estado civil / Marital", a: optLabel(MARITAL_OPTIONS, d.personal.maritalStatus) },
      { q: "Educação / Education", a: optLabel(EDUCATION_OPTIONS, d.education.level) },
      { q: "Empregador atual / Current employer", a: `${d.currentEmployment.employer} ${d.currentEmployment.jobTitle}`.trim() },
      { q: "Cidadania / Citizenship", a: d.address.citizenship },
      { q: "Declaração / Declaration", a: d.declaration.agreed ? "Aceita / Accepted" : "Não aceita" },
    ];
    return (
      <div>
        <div style={{ marginBottom: 14 }}>
          <a className="btn btn--ghost btn--sm" href={`/api/applications/${appId}/pdf`} target="_blank" rel="noopener noreferrer">
            <Icon n="file-text" /> Baixar PDF do G1 completo
          </a>
        </div>
        <div className="kicker" style={{ marginBottom: 8 }}>Resumo</div>
        {summary.map((r, i) => (
          <Row key={i} q={r.q} a={r.a} />
        ))}
      </div>
    );
  }

  // formato antigo (questionário por vaga)
  const items = (Array.isArray(answers) ? answers : []) as LegacyAnswer[];
  return (
    <div>
      {items.map((a, i) => (
        <Row key={i} q={a.label} a={a.answer} />
      ))}
    </div>
  );
}
