import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { JobForm, type JobFormData } from "@/components/JobForm";

export const dynamic = "force-dynamic";

// Edição de uma vaga EB-3 e suas perguntas.
export default async function EditarVagaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const t = await getTranslations("admin");
  const tn = await getTranslations("nav");

  const job = await prisma.eb3Job.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!job) notFound();

  const initial: JobFormData = {
    id: job.id,
    title: job.title,
    employer: job.employer,
    logo: job.logo ?? "",
    location: job.location,
    type: job.type,
    visa: job.visa,
    salary: job.salary,
    openings: job.openings,
    postedLabel: job.postedLabel ?? "",
    description: job.description,
    requirements: job.requirements,
    process: job.process ?? "",
    observations: job.observations ?? "",
    published: job.published,
    questions: job.questions.map((q) => ({
      label: q.label,
      helpText: q.helpText ?? "",
      type: q.type,
      required: q.required,
    })),
  };

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/admin/vagas">{tn("jobs")}</Link> <Icon n="chevron-right" /> <span>{job.title}</span>
      </div>
      <div className="pagehead">
        <div>
          <div className="kicker">{t("panelKicker")}</div>
          <h1>{t("editJobTitle")}</h1>
          <p>
            {job.employer} · {job.visa}
          </p>
        </div>
      </div>
      <JobForm initial={initial} />
    </div>
  );
}
