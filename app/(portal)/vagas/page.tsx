import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { JobsList } from "@/components/JobsList";

// Lista de vagas EB-3 (acesso gratuito para clientes logados).
export const dynamic = "force-dynamic";

export default async function VagasPage() {
  await requireUser();

  const jobs = await prisma.eb3Job.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, employer: true, logo: true, location: true,
      type: true, visa: true, salary: true, openings: true, postedLabel: true,
    },
  });

  return (
    <div className="container">
      <div className="pagehead">
        <div>
          <div className="kicker">Oportunidades</div>
          <h1>Vagas com patrocínio EB-3</h1>
          <p>Posições verificadas, exclusivas do programa de Green Card por trabalho.</p>
        </div>
      </div>
      <JobsList jobs={jobs} />
    </div>
  );
}
