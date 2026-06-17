import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { AnswersBlock } from "@/components/AnswersBlock";
import { createCase } from "@/lib/actions/cases";
import { setApplicationEditUnlock } from "@/lib/actions/applications";

export const dynamic = "force-dynamic";

// Lista de candidaturas recebidas (todas as aplicações às vagas EB-3).
export default async function CandidaturasPage() {
  await requireAdmin();
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const fmtDateTime = (d: Date) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(d);

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true, employer: true, visa: true } },
      user: { select: { id: true, name: true, email: true, country: true, case: { select: { id: true } } } },
      revisions: { orderBy: { createdAt: "desc" }, select: { id: true, answers: true, createdAt: true } },
    },
  });

  return (
    <div className="container container--wide">
      <div className="pagehead">
        <div>
          <div className="kicker">{t("panelKicker")}</div>
          <h1>{t("candidaturasTitle")}</h1>
          <p>{t("candidaturasSubtitle")}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="send" />
            </div>
            <h3>{t("noCandidaturasTitle")}</h3>
            <p>{t("noCandidaturasText")}</p>
          </div>
        </div>
      ) : (
        applications.map((app) => {
          const hasCase = !!app.user.case;
          return (
            <div className="card formcard" key={app.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ marginBottom: 6 }}>
                    {app.job.title} · {app.job.employer}
                  </h3>
                  <div className="casemeta" style={{ marginTop: 0 }}>
                    <span>
                      <Icon n="user" /> <b>{app.user.name ?? "—"}</b> · {app.user.email}
                    </span>
                    {app.user.country && (
                      <span>
                        <Icon n="flag" /> {app.user.country}
                      </span>
                    )}
                    <span>
                      <Icon n="calendar-event" /> {fmtDateTime(app.createdAt)}
                    </span>
                    {app.revisions.length > 0 && app.updatedAt && (
                      <span>
                        <Icon n="edit" /> {t("editedAt", { date: fmtDateTime(app.updatedAt) })}
                      </span>
                    )}
                    {app.editUnlocked && (
                      <span>
                        <Icon n="lock-open" /> {t("editUnlockedChip")}
                      </span>
                    )}
                    <span>
                      <Icon n="discount-check" /> {t("consentAccepted")}
                      {app.consentIp ? ` · IP ${app.consentIp}` : ""}
                    </span>
                    <span title={app.emailMessageId ?? app.emailError ?? ""}>
                      <Icon n={app.emailSentAt ? "mail-check" : "mail-x"} />{" "}
                      {app.emailSentAt ? t("emailSent") : t("emailNotSent")}
                      {app.emailSentAt && app.emailMessageId
                        ? ` · ${app.emailMessageId.replace(/[<>]/g, "").slice(0, 28)}`
                        : ""}
                      {!app.emailSentAt && app.emailError ? `: ${app.emailError.slice(0, 90)}` : ""}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <form action={setApplicationEditUnlock}>
                    <input type="hidden" name="applicationId" value={app.id} />
                    <input type="hidden" name="unlock" value={app.editUnlocked ? "0" : "1"} />
                    <button className="btn btn--ghost btn--sm" type="submit">
                      <Icon n={app.editUnlocked ? "lock" : "lock-open"} />{" "}
                      {app.editUnlocked ? t("relockEdit") : t("unlockEdit")}
                    </button>
                  </form>
                  {hasCase ? (
                    <Link className="btn btn--ghost btn--sm" href={`/admin/casos/${app.user.case!.id}`}>
                      <Icon n="arrow-right" /> {t("seeCase")}
                    </Link>
                  ) : (
                    <form action={createCase}>
                      <input type="hidden" name="userId" value={app.user.id} />
                      <input type="hidden" name="jobLabel" value={`${app.job.title} · ${app.job.employer}`} />
                      <input type="hidden" name="country" value={app.user.country ?? ""} />
                      <button className="btn btn--primary btn--sm" type="submit">
                        <Icon n="plus" /> {t("openCaseShort")}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <AnswersBlock appId={app.id} answers={app.answers} />
              </div>

              {app.revisions.length > 0 && (
                <details style={{ marginTop: 14 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                    <Icon n="history" /> {t("historyTitle", { count: app.revisions.length })}
                  </summary>
                  {app.revisions.map((rev, i) => (
                    <div className="g1block" key={rev.id} style={{ marginTop: 12 }}>
                      <div className="kicker" style={{ marginBottom: 8 }}>
                        {t("versionLabel", { n: app.revisions.length - i })} · {fmtDateTime(rev.createdAt)}
                      </div>
                      <AnswersBlock appId={app.id} answers={rev.answers} hidePdf />
                    </div>
                  ))}
                </details>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
