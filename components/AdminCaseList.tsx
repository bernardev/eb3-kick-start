"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { StatusBadge } from "./Status";
import type { StatusKey } from "@/lib/status";

export type AdminCaseRow = {
  id: string;
  name: string;
  initials: string;
  caseNo: string;
  country: string;
  phaseTitle: string;
  status: StatusKey;
  updatedLabel: string;
};

const FILTERS: { k: "all" | StatusKey; label: string }[] = [
  { k: "all", label: "Todos" },
  { k: "analysis", label: "Em análise" },
  { k: "pending", label: "Pendência" },
  { k: "denied", label: "Negado" },
  { k: "approved", label: "Aprovado" },
];

export function AdminCaseList({ cases }: { cases: AdminCaseRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | StatusKey>("all");

  const filtered = cases.filter((c) => {
    const mq = (c.name + " " + c.caseNo + " " + c.country).toLowerCase().includes(q.toLowerCase());
    const mf = filter === "all" || c.status === filter;
    return mq && mf;
  });

  // Nenhum caso aberto ainda (não é questão de filtro).
  if (cases.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          <div className="empty__ic">
            <Icon n="folder-off" />
          </div>
          <h3>Nenhum caso aberto ainda</h3>
          <p>
            As candidaturas recebidas ficam em &quot;Candidaturas&quot;. Abra um caso a partir de uma
            candidatura para começar a acompanhar o processo do cliente.
          </p>
          <div className="welcome__actions" style={{ marginTop: 18 }}>
            <Link className="btn btn--primary" href="/admin/candidaturas">
              <Icon n="send" /> Ver candidaturas
            </Link>
            <Link className="btn btn--ghost" href="/admin/casos/novo">
              <Icon n="plus" /> Abrir caso manualmente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Icon n="search" />
          <input
            placeholder="Buscar por nome, nº do caso ou país…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="chips">
          {FILTERS.map((f) => (
            <button
              key={f.k}
              className={"chip" + (filter === f.k ? " is-active" : "")}
              onClick={() => setFilter(f.k)}
            >
              {f.k !== "all" && <span className={`ico-dot dot--${f.k}`} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="folder-off" />
            </div>
            <h3>Nenhum caso encontrado</h3>
            <p>Ajuste a busca ou os filtros de status para ver mais resultados.</p>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
            >
              <Icon n="refresh" /> Limpar filtros
            </button>
          </div>
        </div>
      ) : (
        <div className="tablewrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Origem</th>
                <th>Fase atual</th>
                <th>Status</th>
                <th>Atualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr className="adminrow" key={c.id} onClick={() => router.push(`/admin/casos/${c.id}`)}>
                  <td>
                    <div className="client">
                      <span className="avatar">{c.initials}</span>
                      <div>
                        <div className="cname">{c.name}</div>
                        <div className="ccase">{c.caseNo}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Icon n="flag" /> {c.country}
                    </span>
                  </td>
                  <td>
                    <span className="phasecol">{c.phaseTitle}</span>
                  </td>
                  <td>
                    <StatusBadge status={c.status} withDot />
                  </td>
                  <td>{c.updatedLabel}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="editlink">
                      Abrir <Icon n="arrow-right" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
