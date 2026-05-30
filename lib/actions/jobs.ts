"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

const questionSchema = z.object({
  label: z.string().trim().min(1),
  helpText: z.string().trim().optional().default(""),
  type: z.enum(["TEXT", "TEXTAREA"]),
  required: z.boolean(),
});

const jobSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Informe o título da vaga."),
  employer: z.string().trim().min(2, "Informe o empregador."),
  logo: z.string().trim().max(4).optional().default(""),
  location: z.string().trim().min(2, "Informe a localização."),
  type: z.string().trim().min(2, "Informe o tipo (ex.: Tempo integral)."),
  visa: z.string().trim().min(2, "Informe a categoria do visto."),
  salary: z.string().trim().min(1, "Informe o salário."),
  openings: z.number().int().min(1).max(9999),
  postedLabel: z.string().trim().optional().default(""),
  description: z.string().trim().min(10, "Descreva a vaga."),
  requirements: z.array(z.string().trim().min(1)),
  published: z.boolean(),
  questions: z.array(questionSchema),
});

export type JobInput = z.input<typeof jobSchema>;
export type JobActionResult = { error?: string };

// Cria ou atualiza uma vaga EB-3 (com suas perguntas). Em sucesso, redireciona.
export async function saveJob(input: JobInput): Promise<JobActionResult> {
  await requireAdmin();

  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;

  const jobData = {
    title: d.title, employer: d.employer, logo: d.logo || null, location: d.location,
    type: d.type, visa: d.visa, salary: d.salary, openings: d.openings,
    postedLabel: d.postedLabel || null, description: d.description,
    requirements: d.requirements, published: d.published,
  };

  if (d.id) {
    await prisma.$transaction([
      prisma.eb3Job.update({ where: { id: d.id }, data: jobData }),
      prisma.jobQuestion.deleteMany({ where: { jobId: d.id } }),
      prisma.jobQuestion.createMany({
        data: d.questions.map((q, i) => ({
          jobId: d.id!, order: i, label: q.label,
          helpText: q.helpText || null, type: q.type, required: q.required,
        })),
      }),
    ]);
  } else {
    await prisma.eb3Job.create({
      data: {
        ...jobData,
        questions: {
          create: d.questions.map((q, i) => ({
            order: i, label: q.label, helpText: q.helpText || null,
            type: q.type, required: q.required,
          })),
        },
      },
    });
  }

  revalidatePath("/admin/vagas");
  revalidatePath("/vagas");
  redirect("/admin/vagas");
}

// Remove uma vaga (e suas perguntas/aplicações em cascata).
export async function deleteJob(id: string) {
  await requireAdmin();
  await prisma.eb3Job.delete({ where: { id } });
  revalidatePath("/admin/vagas");
  revalidatePath("/vagas");
  redirect("/admin/vagas");
}
