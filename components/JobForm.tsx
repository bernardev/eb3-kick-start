"use client";

import { useState, useTransition } from "react";
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
  const base = initial ?? EMPTY;

  const [f, setF] = useState<Omit<JobFormData, "requirements" | "questions">>({
    id: base.id, title: base.title, employer: base.employer, logo: base.logo,
    location: base.location, type: base.type, visa: base.visa, salary: base.salary,
    openings: base.openings, postedLabel: base.postedLabel,
    description: base.description, published: base.published,
  });
  const [reqText, setReqText] = useState(base.requirements.join("\n"));
  const [questions, setQuestions] = useState<QuestionDraft[]>(base.questions);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const addQuestion = () =>
    setQuestions((qs) => [...qs, { label: "", helpText: "", type: "TEXT", required: true }]);
  const updateQuestion = (i: number, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const removeQuestion = (i: number) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await saveJob({
        ...f,
        requirements: reqText.split("\n").map((r) => r.trim()).filter(Boolean),
        questions: questions
          .map((q) => ({ ...q, label: q.label.trim() }))
          .filter((q) => q.label.length > 0),
      });
      if (res?.error) setError(res.error);
      // sucesso redireciona no servidor
    });
  };

  const onDelete = () => {
    if (!f.id) return;
    if (!confirm("Remover esta vaga? As aplicações ligadas a ela também serão removidas.")) return;
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
        <h3>Dados da vaga</h3>
        <div className="formgrid">
          <div className="field">
            <label className="field__label">Título</label>
            <input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Auxiliar de Cozinha" />
          </div>
          <div className="field">
            <label className="field__label">Empregador</label>
            <input className="input" value={f.employer} onChange={(e) => set("employer", e.target.value)} placeholder="Blue Ridge Hospitality" />
          </div>
          <div className="field">
            <label className="field__label">Localização</label>
            <input className="input" value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Asheville, NC" />
          </div>
          <div className="field">
            <label className="field__label">Tipo</label>
            <input className="input" value={f.type} onChange={(e) => set("type", e.target.value)} placeholder="Tempo integral" />
          </div>
          <div className="field">
            <label className="field__label">Categoria do visto</label>
            <input className="input" value={f.visa} onChange={(e) => set("visa", e.target.value)} placeholder="EB-3 · Unskilled" />
          </div>
          <div className="field">
            <label className="field__label">Salário</label>
            <input className="input" value={f.salary} onChange={(e) => set("salary", e.target.value)} placeholder="$15.50/h" />
          </div>
          <div className="field">
            <label className="field__label">Vagas abertas</label>
            <input className="input" type="number" min={1} value={f.openings} onChange={(e) => set("openings", Number(e.target.value))} />
          </div>
          <div className="field">
            <label className="field__label">Iniciais do logo (opcional)</label>
            <input className="input" maxLength={4} value={f.logo} onChange={(e) => set("logo", e.target.value)} placeholder="BR" />
          </div>
          <div className="field">
            <label className="field__label">Rótulo de publicação (opcional)</label>
            <input className="input" value={f.postedLabel} onChange={(e) => set("postedLabel", e.target.value)} placeholder="2 dias atrás" />
          </div>
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label className="field__label">Descrição da vaga</label>
          <textarea className="input" style={{ minHeight: 110 }} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Descreva a posição, o empregador e o patrocínio EB-3…" />
        </div>

        <div className="field">
          <label className="field__label">Requisitos (um por linha)</label>
          <textarea className="input" style={{ minHeight: 90 }} value={reqText} onChange={(e) => setReqText(e.target.value)} placeholder={"Sem exigência de inglês avançado\nMaior de 18 anos\nPassaporte válido"} />
        </div>

        <label className="consent" style={{ marginBottom: 0 }}>
          <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
          <span>Publicada (visível para os clientes)</span>
        </label>
      </div>

      <div className="card formcard">
        <h3>Perguntas do questionário</h3>
        <p className="muted" style={{ marginTop: -10, marginBottom: 16, fontSize: 13.5 }}>
          Estas perguntas aparecem no fluxo &quot;Aplique aqui&quot; desta vaga.
        </p>

        {questions.length === 0 && (
          <p className="muted" style={{ marginBottom: 14 }}>Nenhuma pergunta ainda.</p>
        )}

        {questions.map((q, i) => (
          <div className="qrow" key={i}>
            <div className="grow">
              <input className="input" value={q.label} onChange={(e) => updateQuestion(i, { label: e.target.value })} placeholder={`Pergunta ${i + 1}`} style={{ marginBottom: 8 }} />
              <div className="formgrid">
                <input className="input" value={q.helpText} onChange={(e) => updateQuestion(i, { helpText: e.target.value })} placeholder="Texto de ajuda (opcional)" />
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="select" style={{ flex: 1 }}>
                    <select value={q.type} onChange={(e) => updateQuestion(i, { type: e.target.value as QuestionDraft["type"] })}>
                      <option value="TEXT">Resposta curta</option>
                      <option value="TEXTAREA">Resposta longa</option>
                    </select>
                    <Icon n="selector" />
                  </div>
                  <label className="consent" style={{ margin: 0, padding: "9px 12px" }}>
                    <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(i, { required: e.target.checked })} />
                    <span style={{ fontSize: 13 }}>Obrigatória</span>
                  </label>
                </div>
              </div>
            </div>
            <button type="button" className="iconbtn" onClick={() => removeQuestion(i)} title="Remover pergunta">
              <Icon n="trash" />
            </button>
          </div>
        ))}

        <button type="button" className="btn btn--ghost btn--sm" onClick={addQuestion} style={{ marginTop: 6 }}>
          <Icon n="plus" /> Adicionar pergunta
        </button>
      </div>

      <div className="formactions">
        <button className="btn btn--primary btn--lg" onClick={submit} disabled={pending}>
          <Icon n="device-floppy" /> {pending ? "Salvando…" : "Salvar vaga"}
        </button>
        <button className="btn btn--ghost" onClick={() => router.push("/admin/vagas")} disabled={pending} type="button">
          Cancelar
        </button>
        {f.id && (
          <button className="btn btn--quiet" onClick={onDelete} disabled={pending} type="button" style={{ marginLeft: "auto", color: "var(--st-denied)" }}>
            <Icon n="trash" /> Remover vaga
          </button>
        )}
      </div>
    </>
  );
}
