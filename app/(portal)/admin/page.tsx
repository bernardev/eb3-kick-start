import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { deriveCaseSummary, type StatusKey } from "@/lib/status";
import { initials } from "@/lib/util";
import { AdminCaseList, type AdminCaseRow } from "@/components/AdminCaseList";

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

// Painel da equipe — listagem e gestão de casos EB-3.
export default async function AdminPage() {
  await requireAdmin();

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
          <div className="kicker">Painel da equipe</div>
          <h1>Gestão de casos EB-3</h1>
          <p>Acompanhe e atualize o andamento de cada cliente.</p>
        </div>
      </div>

      <div className="statline">
        <div className="stat">
          <div className="stat__n">{rows.length}</div>
          <div className="stat__l">Casos ativos</div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("analysis")}</div>
          <div className="stat__l">
            <span className="dot dot--analysis" /> Em análise
          </div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("pending")}</div>
          <div className="stat__l">
            <span className="dot dot--pending" /> Pendência
          </div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("denied")}</div>
          <div className="stat__l">
            <span className="dot dot--denied" /> Negado
          </div>
        </div>
        <div className="stat">
          <div className="stat__n">{count("approved")}</div>
          <div className="stat__l">
            <span className="dot dot--approved" /> Aprovado
          </div>
        </div>
      </div>

      <AdminCaseList cases={rows} />
    </div>
  );
}
