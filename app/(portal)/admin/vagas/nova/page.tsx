import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { JobForm } from "@/components/JobForm";

// Cadastro de nova vaga EB-3.
export default async function NovaVagaPage() {
  await requireAdmin();
  const t = await getTranslations("admin");
  const tn = await getTranslations("nav");

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/admin/vagas">{tn("jobs")}</Link> <Icon n="chevron-right" /> <span>{t("newJob")}</span>
      </div>
      <div className="pagehead">
        <div>
          <div className="kicker">{t("panelKicker")}</div>
          <h1>{t("newJobTitle")}</h1>
          <p>{t("newJobSubtitle")}</p>
        </div>
      </div>
      <JobForm />
    </div>
  );
}
