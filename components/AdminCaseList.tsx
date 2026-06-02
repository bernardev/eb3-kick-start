"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

const FILTER_KEYS: ("all" | StatusKey)[] = ["all", "analysis", "pending", "denied", "approved"];

export function AdminCaseList({ cases }: { cases: AdminCaseRow[] }) {
  const router = useRouter();
  const t = useTranslations("admin");
  const ts = useTranslations("status");
  const filterLabel = (k: "all" | StatusKey) => (k === "all" ? t("filterAll") : ts(k));
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
          <h3>{t("noCasesYetTitle")}</h3>
          <p>{t("noCasesYetText")}</p>
          <div className="welcome__actions" style={{ marginTop: 18 }}>
            <Link className="btn btn--primary" href="/admin/candidaturas">
              <Icon n="send" /> {t("seeApplications")}
            </Link>
            <Link className="btn btn--ghost" href="/admin/casos/novo">
              <Icon n="plus" /> {t("openCaseManual")}
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
            placeholder={t("searchCases")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="chips">
          {FILTER_KEYS.map((k) => (
            <button
              key={k}
              className={"chip" + (filter === k ? " is-active" : "")}
              onClick={() => setFilter(k)}
            >
              {k !== "all" && <span className={`ico-dot dot--${k}`} />}
              {filterLabel(k)}
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
            <h3>{t("noCasesFoundTitle")}</h3>
            <p>{t("noCasesFoundText")}</p>
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
        <div className="tablewrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("colClient")}</th>
                <th>{t("colOrigin")}</th>
                <th>{t("colCurrentPhase")}</th>
                <th>{t("colStatus")}</th>
                <th>{t("colUpdated")}</th>
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
                      {t("open")} <Icon n="arrow-right" />
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
