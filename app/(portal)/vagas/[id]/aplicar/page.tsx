import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { G1Form } from "@/components/G1Form";
import { SupportCta } from "@/components/SupportCta";
import type { G1Data } from "@/lib/g1";
import { caseStatusChanged } from "@/lib/case-lock";

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

  // Aplicação já enviada por este candidato para esta vaga (a mais recente),
  // e se o caso já foi aberto (status alterado) — o que trava a edição.
  const existing = await prisma.application.findFirst({
    where: { userId: user.id, jobId: job.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, answers: true, editUnlocked: true },
  });
  const statusChanged = await caseStatusChanged(user.id);
  // Travado quando o status já mudou, salvo se a equipe liberou esta aplicação.
  const locked = !!existing && statusChanged && !existing.editUnlocked;
  const editing = !!existing && !locked; // pode reabrir e editar

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
          <h1>{editing ? t("editTitle", { job: job.title }) : t("title", { job: job.title })}</h1>
          <p>
            {job.employer} · {job.visa}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SupportCta />
      </div>

      {locked ? (
        <div className="notice">
          <Icon n="lock" />
          <div>
            <div className="notice__t">{t("lockedTitle")}</div>
            <p>{t("lockedText")}</p>
            <div style={{ marginTop: 12 }}>
              <Link className="btn btn--ghost btn--sm" href="/meu-processo">
                <Icon n="route" /> {t("lockedCta")}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {editing && (
            <div className="notice" style={{ marginBottom: 18 }}>
              <Icon n="edit" />
              <div>
                <div className="notice__t">{t("editNoticeTitle")}</div>
                <p>{t("editNoticeText")}</p>
              </div>
            </div>
          )}
          <G1Form
            job={{ id: job.id, title: job.title, employer: job.employer, visa: job.visa }}
            defaultEmail={user.email ?? undefined}
            initialData={editing ? (existing!.answers as unknown as G1Data) : undefined}
            applicationId={editing ? existing!.id : undefined}
          />
        </>
      )}
    </div>
  );
}
