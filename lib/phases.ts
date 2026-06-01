// Estrutura fixa das 4 fases do processo EB-3 (Selection → DOL/PERM →
// I-140 → I-485/Consular). Usada ao abrir um novo caso.
export const STANDARD_PHASES = [
  {
    key: "sel",
    icon: "clipboard-check",
    title: "Processo Seletivo",
    subtitle: "Triagem inicial, entrevista e match com empregador",
    steps: [
      { name: "Inscrição e formulário", sub: "Dados pessoais e currículo" },
      { name: "Entrevista com a equipe Kick Start", sub: null },
      { name: "Match e carta de oferta do empregador", sub: null },
    ],
  },
  {
    key: "dol",
    icon: "building-bank",
    title: "Department of Labor — PERM",
    subtitle: "Labor Certification (ETA Form 9089)",
    steps: [
      { name: "Prevailing Wage Determination", sub: "Definição do salário pelo DOL" },
      { name: "Recrutamento e anúncios", sub: "Etapa de teste do mercado de trabalho" },
      { name: "PERM Labor Certification", sub: "ETA-9089" },
    ],
  },
  {
    key: "i140",
    icon: "file-certificate",
    title: "USCIS — I-140",
    subtitle: "Petição de Imigrante para Trabalhador Estrangeiro",
    steps: [
      { name: "Preparação e protocolo do I-140", sub: null },
      { name: "Análise pelo USCIS", sub: null },
    ],
  },
  {
    key: "i485",
    icon: "plane-departure",
    title: "I-485 / Processo Consular",
    subtitle: "Ajuste de status ou entrevista no consulado",
    steps: [
      { name: "Disponibilidade de número de visto", sub: "Visa Bulletin" },
      { name: "I-485 ou entrevista consular", sub: null },
    ],
  },
] as const;
