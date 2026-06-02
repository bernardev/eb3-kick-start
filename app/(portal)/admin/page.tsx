import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { deriveCaseSummary, type StatusKey } from "@/lib/status";
import { initials } from "@/lib/util";
import { Icon } from "@/components/Icon";
import { AdminCaseList, type AdminCaseRow } from "@/components/AdminCaseList";

export const dynamic = "force-dynamic";

// Painel da equipe — listagem e gestão de casos EB-3.
export default async function AdminPage() {
  await requireAdmin();
  const t = await getTranslations("admin");
  const ts = await getTranslations("status");
  const locale = await getLocale();
  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);

  const cases = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true } },
      phases: {
        orderBy: { order: "asc" },
        include: { steps: { orderBy: { order: "asc" } } },
      },
    },
  });

  const rows: AdminCaseRow[] = cases.map((c) => {
    const summary = deriveCaseSummary(c.phases);
    return {
      id: c.id,
      name: c.user.name ?? "Cliente",
      initials: initials(c.user.name),
      caseNo: c.caseNo,
      country: c.country ?? "—",
      phaseTitle: summary.phaseTitle,
      status: summary.status,
      updatedLabel: fmtDate(c.updatedAt),
    };
  });

  const count = (s: StatusKey) => rows.filter((r) => r.status === s).length;

  return (
    <div className="container container--wide">
      <div className="pagehead">
        <div>
          <div className="kicker">{t("panelKicker")}</div>
          <h1>{t("casesTitle")}</h1>
          <p>{t("casesSubtitle")}</p>
        </div>
        <Link className="btn btn--primary" href="/admin/casos/novo">
          <Icon n="plus" /> {t("newCase")}
        </Link>
      </div>

      <div className="statline">
        <div className="stat">
          <div className="stat__n">{rows.length}</div>
          <div className="stat__l">{t("statActive")}</div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("analysis")}</div>
          <div className="stat__l">
            <span className="dot dot--analysis" /> {ts("analysis")}
          </div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("pending")}</div>
          <div className="stat__l">
            <span className="dot dot--pending" /> {ts("pending")}
          </div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("denied")}</div>
          <div className="stat__l">
            <span className="dot dot--denied" /> {ts("denied")}
          </div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("approved")}</div>
          <div className="stat__l">
            <span className="dot dot--approved" /> {ts("approved")}
          </div>
        </div>
      </div>

      <AdminCaseList cases={rows} />
    </div>
  );
}
