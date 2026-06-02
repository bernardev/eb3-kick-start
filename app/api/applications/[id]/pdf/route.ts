import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderG1Pdf } from "@/lib/g1-pdf";
import type { G1Data } from "@/lib/g1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Baixa/visualiza o PDF do G1 de uma aplicação (somente equipe/admin).
// O PDF é regenerado a partir dos dados salvos — não precisa de storage.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new Response("Acesso restrito.", { status: 403 });
  }

  const { id } = await params;
  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { select: { title: true, employer: true, visa: true } },
      user: { select: { name: true, email: true } },
    },
  });
  if (!app) return new Response("Aplicação não encontrada.", { status: 404 });

  const data = app.answers as unknown as G1Data;
  if (!data || Array.isArray(app.answers) || !data.personal) {
    return new Response("Esta aplicação não está no formato G1.", { status: 400 });
  }

  const name =
    `${data.personal.firstName ?? ""} ${data.personal.lastName ?? ""}`.trim() ||
    app.user.name ||
    "candidato";

  const pdf = await renderG1Pdf(data, {
    jobTitle: app.job.title,
    jobEmployer: app.job.employer,
    jobVisa: app.job.visa,
    applicantName: name,
    applicantEmail: data.additional?.email || app.user.email || "—",
    submittedAt: app.createdAt,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="G1-${name.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf"`,
    },
  });
}
