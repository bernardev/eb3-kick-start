import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { createCase } from "@/lib/actions/cases";

export const dynamic = "force-dynamic";

// Abertura manual de um caso para um cliente que ainda não tem processo.
export default async function NovoCasoPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  await requireAdmin();
  const { userId } = await searchParams;
  const t = await getTranslations("admin");
  const tn = await getTranslations("nav");

  // Clientes sem caso aberto (elegíveis).
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", case: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/admin">{tn("cases")}</Link> <Icon n="chevron-right" /> <span>{t("newCase")}</span>
      </div>
      <div className="pagehead">
        <div>
          <div className="kicker">{t("panelKicker")}</div>
          <h1>{t("newCaseTitle")}</h1>
          <p>{t("newCaseSubtitle")}</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="users" />
            </div>
            <h3>{t("noClientsTitle")}</h3>
            <p>{t("noClientsText")}</p>
          </div>
        </div>
      ) : (
        <form action={createCase}>
          <div className="card formcard">
            <h3>{t("caseData")}</h3>
            <div className="field">
              <label className="field__label">{t("client")}</label>
              <div className="select">
                <select name="userId" defaultValue={userId ?? ""} required>
                  <option value="" disabled>
                    {t("selectClient")}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? "—"} — {c.email}
                    </option>
                  ))}
                </select>
                <Icon n="selector" />
              </div>
            </div>

            <div className="formgrid">
              <div className="field">
                <label className="field__label">{t("caseNo")}</label>
                <input className="input" name="caseNo" placeholder={t("caseNoPlaceholder")} />
              </div>
              <div className="field">
                <label className="field__label">{t("countryOpt")}</label>
                <input className="input" name="country" placeholder="Brasil" />
              </div>
              <div className="field">
                <label className="field__label">{t("managerOpt")}</label>
                <input className="input" name="manager" placeholder="Daia" />
              </div>
              <div className="field">
                <label className="field__label">{t("linkedJobOpt")}</label>
                <input className="input" name="jobLabel" placeholder="Auxiliar de Cozinha · Blue Ridge Hospitality" />
              </div>
            </div>
          </div>

          <div className="formactions">
            <button className="btn btn--primary btn--lg" type="submit">
              <Icon n="plus" /> {t("openCase")}
            </button>
            <Link className="btn btn--ghost" href="/admin">
              {t("cancel")}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
