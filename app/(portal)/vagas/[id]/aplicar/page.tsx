import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { G1Form } from "@/components/G1Form";

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

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/vagas">Vagas EB-3</Link> <Icon n="chevron-right" />{" "}
        <Link href={`/vagas/${job.id}`}>{job.title}</Link> <Icon n="chevron-right" />{" "}
        <span>Aplicar</span>
      </div>

      <div className="pagehead">
        <div>
          <div className="kicker">Aplicação EB-3 · G1 Form</div>
          <h1>Aplique para {job.title}</h1>
          <p>
            {job.employer} · {job.visa}
          </p>
        </div>
      </div>

      <G1Form
        job={{ id: job.id, title: job.title, employer: job.employer, visa: job.visa }}
        defaultEmail={user.email ?? undefined}
      />
    </div>
  );
}
