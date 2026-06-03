import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { G1Form } from "@/components/G1Form";
import { SupportCta } from "@/components/SupportCta";

export const dynamic = "force-dynamic";

// Fluxo "Aplique aqui": Formulário G1 (intake) + aviso + consentimento.
export default async function AplicarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const job = await prisma.eb3Job.findFirst({ where: { id, published: true } });
  if (!job) notFound();

  const t = await getTranslations("apply");
  const td = await getTranslations("jobDetail");

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/vagas">{td("breadcrumb")}</Link> <Icon n="chevron-right" />{" "}
        <Link href={`/vagas/${job.id}`}>{job.title}</Link> <Icon n="chevron-right" />{" "}
        <span>{t("crumbApply")}</span>
      </div>

      <div className="pagehead">
        <div>
          <div className="kicker">{t("kicker")}</div>
          <h1>{t("title", { job: job.title })}</h1>
          <p>
            {job.employer} · {job.visa}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SupportCta />
      </div>

      <G1Form
        job={{ id: job.id, title: job.title, employer: job.employer, visa: job.visa }}
        defaultEmail={user.email ?? undefined}
      />
    </div>
  );
}
