"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("jobs");
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
          <h3>{t("introTitle")}</h3>
          <p>{t("introText")}</p>
        </div>
        <span className="badge badge--approved">
          <Icon n="shield-check" /> {t("introBadge")}
        </span>
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon n="search" />
          <input
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="chips">
          <button className={"chip" + (filter === "all" ? " is-active" : "")} onClick={() => setFilter("all")}>
            {t("filterAll")}
          </button>
          <button className={"chip" + (filter === "unskilled" ? " is-active" : "")} onClick={() => setFilter("unskilled")}>
            {t("filterUnskilled")}
          </button>
          <button className={"chip" + (filter === "skilled" ? " is-active" : "")} onClick={() => setFilter("skilled")}>
            {t("filterSkilled")}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="briefcase-off" />
            </div>
            <h3>{t("emptyTitle")}</h3>
            <p>{t("emptyText")}</p>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
            >
              <Icon n="refresh" /> {t("clearFilters")}
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
                  <Icon n="calendar" />{" "}
                  {t("postedAndOpenings", { posted: j.postedLabel ?? t("recent"), count: j.openings })}
                </span>
                <span className="jobcard__go">
                  {t("seeDetails")} <Icon n="arrow-right" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
