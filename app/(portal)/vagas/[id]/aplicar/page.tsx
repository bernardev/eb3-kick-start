import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { ApplyForm } from "@/components/ApplyForm";

export const dynamic = "force-dynamic";

// Fluxo "Aplique aqui": questionário + aviso + consentimento.
export default async function AplicarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const job = await prisma.eb3Job.findFirst({
    where: { id, published: true },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!job) notFound();

  return (
    <div className="container">
      <div className="crumbs">
        <Link href="/vagas">Vagas EB-3</Link> <Icon n="chevron-right" />{" "}
        <Link href={`/vagas/${job.id}`}>{job.title}</Link> <Icon n="chevron-right" />{" "}
        <span>Aplicar</span>
      </div>

      <div className="pagehead">
        <div>
          <div className="kicker">Aplicação EB-3</div>
          <h1>Aplique para {job.title}</h1>
          <p>
            {job.employer} · {job.visa}
          </p>
        </div>
      </div>

      <ApplyForm
        job={{ id: job.id, title: job.title, employer: job.employer, visa: job.visa }}
        questions={job.questions.map((q) => ({
          id: q.id,
          label: q.label,
          helpText: q.helpText,
          type: q.type,
          required: q.required,
        }))}
      />
    </div>
  );
}
