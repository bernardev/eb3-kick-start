import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getWpJobs } from "@/lib/wp-jobs";
import { JobsList } from "@/components/JobsList";
import { WpJobsTable } from "@/components/WpJobsTable";

// Lista de vagas EB-3 (acesso gratuito para clientes logados).
export const dynamic = "force-dynamic";

export default async function VagasPage() {
  await requireUser();

  const [jobs, wpJobs] = await Promise.all([
    prisma.eb3Job.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, employer: true, logo: true, location: true,
        type: true, visa: true, salary: true, openings: true, postedLabel: true,
      },
    }),
    getWpJobs(12),
  ]);

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
      <WpJobsTable jobs={wpJobs} />
    </div>
  );
}
