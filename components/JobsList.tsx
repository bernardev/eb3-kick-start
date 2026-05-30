"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";

type Job = {
  id: string;
  title: string;
  employer: string;
  logo: string | null;
  location: string;
  type: string;
  visa: string;
  salary: string;
  openings: number;
  postedLabel: string | null;
};

type Filter = "all" | "unskilled" | "skilled";

export function JobsList({ jobs }: { jobs: Job[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = jobs.filter((j) => {
    const matchQ = (j.title + " " + j.employer + " " + j.location)
      .toLowerCase()
      .includes(q.toLowerCase());
    const matchF = filter === "all" || j.visa.toLowerCase().includes(filter);
    return matchQ && matchF;
  });

  return (
    <>
      {/* destaque EB-3 no topo */}
      <div className="jobs__intro">
        <div className="ic">
          <Icon n="discount-check" />
        </div>
        <div>
          <h3>Vagas exclusivas EB-3</h3>
          <p>
            Todas as posições abaixo oferecem patrocínio de visto permanente. Vagas comuns ficam em
            uma área separada.
          </p>
        </div>
        <span className="badge badge--approved">
          <Icon n="shield-check" /> Patrocínio de visto EB-3
        </span>
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon n="search" />
          <input
            placeholder="Buscar por cargo, empresa ou cidade…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="chips">
          <button className={"chip" + (filter === "all" ? " is-active" : "")} onClick={() => setFilter("all")}>
            Todas
          </button>
          <button className={"chip" + (filter === "unskilled" ? " is-active" : "")} onClick={() => setFilter("unskilled")}>
            Unskilled
          </button>
          <button className={"chip" + (filter === "skilled" ? " is-active" : "")} onClick={() => setFilter("skilled")}>
            Skilled
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="briefcase-off" />
            </div>
            <h3>Nenhuma vaga encontrada</h3>
            <p>Tente ajustar a busca ou os filtros. Novas vagas EB-3 são adicionadas toda semana.</p>
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
        <div className="jobgrid">
          {filtered.map((j) => (
            <Link className="jobcard" key={j.id} href={`/vagas/${j.id}`}>
              <div className="jobcard__top">
                <div className="jobcard__logo">{j.logo ?? j.employer.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <h3>{j.title}</h3>
                  <div className="jobcard__emp">{j.employer}</div>
                </div>
                <span className="visa-tag">
                  <Icon n="license" /> {j.visa}
                </span>
              </div>
              <div className="jobcard__meta">
                <span>
                  <Icon n="map-pin" /> {j.location}
                </span>
                <span>
                  <Icon n="clock" /> {j.type}
                </span>
                <span>
                  <Icon n="cash" /> {j.salary}
                </span>
              </div>
              <div className="jobcard__foot">
                <span className="jobcard__date">
                  <Icon n="calendar" /> {j.postedLabel ?? "Recente"} · {j.openings} vagas
                </span>
                <span className="jobcard__go">
                  Ver detalhes <Icon n="arrow-right" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
