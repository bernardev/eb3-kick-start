/* ============================================================
   KICK START — Portal EB-3 · seed de dados de exemplo
   Cria: usuário admin (equipe), vagas EB-3 com questionário,
   o caso âncora (Eduardo) e outros casos para o painel.
   Rode com: npm run db:seed
   ============================================================ */
import { PrismaClient, type CaseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Senha padrão dos usuários de exemplo (somente para dev/teste).
const DEV_PASSWORD = "kickstart123";

// Vagas EB-3 (mesmas do design aprovado).
const JOBS = [
  {
    title: "Auxiliar de Cozinha", employer: "Blue Ridge Hospitality", logo: "BR",
    location: "Asheville, NC", type: "Tempo integral", visa: "EB-3 · Unskilled", salary: "$15.50/h",
    openings: 8, postedLabel: "2 dias atrás",
    description:
      "Atuação em cozinha de restaurante de rede hoteleira, com treinamento on-the-job. Posição elegível a patrocínio de Green Card via EB-3 (categoria unskilled).",
    requirements: ["Sem exigência de inglês avançado", "Disponibilidade para realocação nos EUA", "Maior de 18 anos", "Passaporte válido"],
  },
  {
    title: "Camareira / Housekeeping", employer: "Sunline Resorts", logo: "SL",
    location: "Orlando, FL", type: "Tempo integral", visa: "EB-3 · Unskilled", salary: "$14.00/h",
    openings: 12, postedLabel: "4 dias atrás",
    description:
      "Limpeza e organização de quartos em resort de grande porte. Empregador com histórico de patrocínio EB-3 e suporte à relocação.",
    requirements: ["Experiência em limpeza é um diferencial", "Boa condição física", "Disponibilidade integral", "Sem antecedentes criminais"],
  },
  {
    title: "Soldador (Welder)", employer: "Ironworks Manufacturing", logo: "IW",
    location: "Houston, TX", type: "Tempo integral", visa: "EB-3 · Skilled", salary: "$24.00/h",
    openings: 3, postedLabel: "1 semana atrás",
    description:
      "Solda MIG/TIG em linha de fabricação industrial. Categoria skilled worker — exige experiência comprovada de 2+ anos.",
    requirements: ["2+ anos de experiência em solda", "Certificação é um diferencial", "Leitura de desenho técnico", "Disponibilidade para relocação"],
  },
  {
    title: "Açougueiro / Meat Cutter", employer: "Heartland Foods", logo: "HF",
    location: "Omaha, NE", type: "Tempo integral", visa: "EB-3 · Skilled", salary: "$19.75/h",
    openings: 5, postedLabel: "1 semana atrás",
    description:
      "Corte e preparo de carnes em planta de processamento. Posição estável com benefícios e patrocínio de visto permanente.",
    requirements: ["Experiência prévia em açougue/frigorífico", "Trabalho em ambiente refrigerado", "Atenção a normas de segurança alimentar"],
  },
  {
    title: "Auxiliar de Produção", employer: "Great Lakes Packaging", logo: "GL",
    location: "Grand Rapids, MI", type: "Tempo integral", visa: "EB-3 · Unskilled", salary: "$16.25/h",
    openings: 15, postedLabel: "2 semanas atrás",
    description:
      "Operação de linha de embalagem e montagem. Treinamento fornecido pela empresa. Ótima porta de entrada no programa EB-3.",
    requirements: ["Sem experiência necessária", "Disponibilidade para turnos", "Trabalho em pé", "Maior de 18 anos"],
  },
  {
    title: "Cuidador de Idosos (Caregiver)", employer: "Evergreen Senior Living", logo: "EV",
    location: "Phoenix, AZ", type: "Tempo integral", visa: "EB-3 · Skilled", salary: "$18.00/h",
    openings: 6, postedLabel: "3 semanas atrás",
    description:
      "Assistência a residentes em comunidade de moradia assistida. Empregador com programa estruturado de patrocínio EB-3.",
    requirements: ["Experiência como cuidador/CNA", "Empatia e paciência", "Inglês básico para comunicação", "Disponibilidade integral"],
  },
];

// Perguntas fixas padrão do questionário (a equipe pode editar por vaga).
const DEFAULT_QUESTIONS = [
  { label: "Nome completo (como no passaporte)", type: "TEXT" as const, required: true },
  { label: "Telefone com WhatsApp (DDI + DDD)", type: "TEXT" as const, required: true },
  { label: "Cidade e país onde mora atualmente", type: "TEXT" as const, required: true },
  { label: "Você possui passaporte válido? Se sim, até quando?", type: "TEXT" as const, required: true },
  {
    label: "Conte sua experiência relevante para esta vaga",
    helpText: "Descreva funções, tempo de experiência e idiomas.",
    type: "TEXTAREA" as const, required: true,
  },
];

// Estrutura fixa das 4 fases do processo EB-3.
const PHASE_DEFS = [
  {
    key: "sel", icon: "clipboard-check", title: "Processo Seletivo",
    subtitle: "Triagem inicial, entrevista e match com empregador",
    steps: [
      { name: "Inscrição e formulário", sub: "Dados pessoais e currículo" },
      { name: "Entrevista com a equipe Kick Start", sub: null },
      { name: "Match e carta de oferta do empregador", sub: null },
    ],
  },
  {
    key: "dol", icon: "building-bank", title: "Department of Labor — PERM",
    subtitle: "Labor Certification (ETA Form 9089)",
    steps: [
      { name: "Prevailing Wage Determination", sub: "Definição do salário pelo DOL" },
      { name: "Recrutamento e anúncios", sub: "Etapa de teste do mercado de trabalho" },
      { name: "PERM Labor Certification", sub: "ETA-9089" },
    ],
  },
  {
    key: "i140", icon: "file-certificate", title: "USCIS — I-140",
    subtitle: "Petição de Imigrante para Trabalhador Estrangeiro",
    steps: [
      { name: "Preparação e protocolo do I-140", sub: null },
      { name: "Análise pelo USCIS", sub: null },
    ],
  },
  {
    key: "i485", icon: "plane-departure", title: "I-485 / Processo Consular",
    subtitle: "Ajuste de status ou entrevista no consulado",
    steps: [
      { name: "Disponibilidade de número de visto", sub: "Visa Bulletin" },
      { name: "I-485 ou entrevista consular", sub: null },
    ],
  },
];

const A = "APPROVED" as CaseStatus;
const N = "NONE" as CaseStatus;

// Monta o objeto de criação das fases a partir de uma matriz de status
// (uma linha por fase) e notas opcionais por fase.
function phasesCreate(matrix: CaseStatus[][], notes: string[] = []) {
  return PHASE_DEFS.map((p, i) => ({
    key: p.key, order: i, icon: p.icon, title: p.title, subtitle: p.subtitle,
    notes: notes[i] ?? "",
    steps: {
      create: p.steps.map((s, j) => ({
        order: j, name: s.name, sub: s.sub, status: matrix[i]?.[j] ?? N,
      })),
    },
  }));
}

async function main() {
  console.log("→ Limpando dados antigos…");
  await prisma.application.deleteMany();
  await prisma.caseStep.deleteMany();
  await prisma.casePhase.deleteMany();
  await prisma.case.deleteMany();
  await prisma.jobQuestion.deleteMany();
  await prisma.eb3Job.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  console.log("→ Criando vagas EB-3 + questionário…");
  for (const j of JOBS) {
    await prisma.eb3Job.create({
      data: {
        ...j,
        questions: {
          create: DEFAULT_QUESTIONS.map((q, i) => ({ ...q, order: i })),
        },
      },
    });
  }

  console.log("→ Criando usuário da equipe (admin)…");
  await prisma.user.create({
    data: {
      name: "Daia", email: "daia@kick-start.us", role: "ADMIN", passwordHash,
    },
  });

  console.log("→ Criando caso âncora (Eduardo)…");
  await prisma.user.create({
    data: {
      name: "Eduardo Henrique", email: "eduardo@example.com", role: "CLIENT",
      country: "Brasil", passwordHash,
      case: {
        create: {
          caseNo: "KS-2026-0047", country: "Brasil", manager: "Daia · Kick Start Team",
          jobLabel: "Auxiliar de Cozinha · Blue Ridge Hospitality",
          phases: {
            create: phasesCreate(
              [
                [A, A, A],
                [A, "ANALYSIS", N],
                [N, N],
                [N, N],
              ],
              [
                "Perfil aprovado. Forte experiência em serviços de alimentação. Empregador (Blue Ridge Hospitality) confirmou a vaga de Auxiliar de Cozinha em Asheville, NC.",
                "Pedido de Prevailing Wage protocolado no DOL em 10/05/2026. Tempo médio de processamento: 6–8 meses. Avisaremos a cada atualização — nenhuma ação é necessária de sua parte neste momento.",
                "",
                "",
              ],
            ),
          },
        },
      },
    },
  });

  console.log("→ Criando demais casos do painel…");
  const others: {
    name: string; email: string; caseNo: string; country: string; manager: string;
    matrix: CaseStatus[][];
  }[] = [
    { name: "Mariana Costa", email: "mariana@example.com", caseNo: "KS-2026-0051", country: "Brasil", manager: "Daia",
      matrix: [["ANALYSIS", "PENDING", N], [N, N, N], [N, N], [N, N]] },
    { name: "Daniel Ferreira", email: "daniel@example.com", caseNo: "KS-2025-0903", country: "Portugal", manager: "Rafael",
      matrix: [[A, A, A], [A, A, A], [A, A], [A, A]] },
    { name: "Lucía Gómez", email: "lucia@example.com", caseNo: "KS-2026-0033", country: "México", manager: "Daia",
      matrix: [[A, A, A], [A, A, A], ["DENIED", N], [N, N]] },
    { name: "João Pereira", email: "joao@example.com", caseNo: "KS-2026-0044", country: "Brasil", manager: "Rafael",
      matrix: [[A, A, A], [A, "ANALYSIS", N], [N, N], [N, N]] },
    { name: "Ana Beatriz Lima", email: "ana@example.com", caseNo: "KS-2026-0058", country: "Brasil", manager: "Daia",
      matrix: [[A, A, A], [N, N, N], [N, N], [N, N]] },
    { name: "Carlos Mendoza", email: "carlos@example.com", caseNo: "KS-2026-0061", country: "Argentina", manager: "Rafael",
      matrix: [[A, A, A], [A, A, A], ["PENDING", N], [N, N]] },
  ];

  for (const c of others) {
    await prisma.user.create({
      data: {
        name: c.name, email: c.email, role: "CLIENT", country: c.country, passwordHash,
        case: {
          create: {
            caseNo: c.caseNo, country: c.country, manager: `${c.manager} · Kick Start Team`,
            phases: { create: phasesCreate(c.matrix) },
          },
        },
      },
    });
  }

  console.log("✓ Seed concluído.");
  console.log(`  Admin:   daia@kick-start.us / ${DEV_PASSWORD}`);
  console.log(`  Cliente: eduardo@example.com / ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
