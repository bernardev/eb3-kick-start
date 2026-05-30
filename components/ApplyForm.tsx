"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { submitApplication, type ApplyState } from "@/lib/actions/applications";
import { CONSENT_NOTICE, CONSENT_CHECKBOX } from "@/lib/consent";
import type { QuestionType } from "@prisma/client";

type Question = {
  id: string;
  label: string;
  helpText: string | null;
  type: QuestionType;
  required: boolean;
};

type JobInfo = { id: string; title: string; employer: string; visa: string };

const initial: ApplyState = {};

export function ApplyForm({ job, questions }: { job: JobInfo; questions: Question[] }) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  const [consent, setConsent] = useState(false);

  // Tela de sucesso após o envio.
  if (state.ok) {
    return (
      <div className="success">
        <div className="success__badge">
          <Icon n="circle-check" />
        </div>
        <h1>Aplicação enviada!</h1>
        <p>
          Recebemos sua aplicação para <b>{job.title}</b> ({job.employer}). A equipe da Kick Start
          vai analisar suas respostas e entrar em contato. Você pode acompanhar o andamento em
          &quot;Meu Processo EB-3&quot;.
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

  return (
    <form action={action}>
      <input type="hidden" name="jobId" value={job.id} />

      <div className="card formcard">
        <h3>Questionário da vaga</h3>
        {questions.length === 0 && (
          <p className="muted">Esta vaga ainda não tem perguntas configuradas.</p>
        )}
        {questions.map((q) => (
          <div className="qfield" key={q.id}>
            <label className="qfield__label" htmlFor={`q_${q.id}`}>
              {q.label}
              {q.required && <span className="req">*</span>}
            </label>
            {q.helpText && <div className="qfield__help">{q.helpText}</div>}
            {q.type === "TEXTAREA" ? (
              <textarea id={`q_${q.id}`} name={`q_${q.id}`} className="input" required={q.required} />
            ) : (
              <input id={`q_${q.id}`} name={`q_${q.id}`} className="input" required={q.required} />
            )}
          </div>
        ))}
      </div>

      {/* aviso obrigatório (texto literal da cliente) */}
      <div className="notice">
        <Icon n="alert-triangle" />
        <div>
          <div className="notice__t">ATENÇÃO!</div>
          <p>{CONSENT_NOTICE.replace("ATENÇÃO! ", "")}</p>
        </div>
      </div>

      {/* consentimento obrigatório */}
      <label className={"consent" + (consent ? " is-checked" : "")}>
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>{CONSENT_CHECKBOX}</span>
      </label>

      {state.error && (
        <div className="formmsg formmsg--error">
          <Icon n="alert-triangle" /> {state.error}
        </div>
      )}

      <div className="formactions">
        <button className="btn btn--primary btn--lg" type="submit" disabled={!consent || pending}>
          <Icon n="send" /> {pending ? "Enviando…" : "Enviar aplicação"}
        </button>
        <Link className="btn btn--quiet" href={`/vagas/${job.id}`}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
