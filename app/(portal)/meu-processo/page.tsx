import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { ProcessView } from "@/components/ProcessView";
import { telegramLink } from "@/lib/support";
import type { UiPhase } from "@/lib/types";

export const dynamic = "force-dynamic";

// Portal do cliente — acompanhamento do próprio processo (somente leitura).
export default async function MeuProcessoPage() {
  const user = await requireUser();
  const t = await getTranslations("portal");
  const locale = await getLocale();
  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);

  const eb3case = await prisma.case.findUnique({
    where: { userId: user.id },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: { steps: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!eb3case) {
    return (
      <div className="container">
        <div className="pagehead">
          <div>
            <div className="kicker">{t("kicker")}</div>
            <h1>{t("myProcess")}</h1>
          </div>
        </div>
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="route" />
            </div>
            <h3>{t("emptyTitle")}</h3>
            <p>{t("emptyText")}</p>
          </div>
        </div>
      </div>
    );
  }

  const phases: UiPhase[] = eb3case.phases.map((p) => ({
    id: p.id,
    key: p.key,
    icon: p.icon,
    title: p.title,
    subtitle: p.subtitle,
    notes: p.notes,
    order: p.order,
    steps: p.steps.map((s) => ({ id: s.id, name: s.name, sub: s.sub, status: s.status })),
  }));

  const initialOpen = phases.slice(0, 2).map((p) => p.id);

  return (
    <div className="container">
      <div className="casehead">
        <div>
          <h1>
            {t("myProcess")}{" "}
            <span className="case-chip">
              <Icon n="hash" /> {eb3case.caseNo}
            </span>
          </h1>
          <div className="casemeta">
            <span>
              <Icon n="calendar-event" /> {t("lastUpdate")} <b>{fmtDate(eb3case.updatedAt)}</b>
            </span>
            {eb3case.manager && (
              <span>
                <Icon n="user-shield" /> {t("caseManager")} <b>{eb3case.manager}</b>
              </span>
            )}
            {eb3case.country && (
              <span>
                <Icon n="flag" /> {t("origin")} <b>{eb3case.country}</b>
              </span>
            )}
          </div>
        </div>
        <a className="btn btn--ghost" href={telegramLink()} target="_blank" rel="noopener noreferrer">
          <Icon n="brand-telegram" /> {t("talkToTeam")}
        </a>
      </div>

      <ProcessView phases={phases} editable={false} initialOpen={initialOpen} />
    </div>
  );
}
