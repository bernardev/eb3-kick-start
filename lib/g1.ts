// ============================================================
//  G1 FORM — Applicant Intake Form (Kick Start / GER)
//  Estrutura de dados + metadados (labels EN/PT) compartilhados
//  entre o formulário web e a geração do PDF preenchido.
// ============================================================

export type YesNo = "" | "YES" | "NO";

export type Opt = { value: string; en: string; pt: string };
export type FieldMeta = {
  key: string;
  en: string;
  pt: string;
  type?: "text" | "textarea" | "date" | "radio";
  options?: Opt[];
};

// ---- opções de seleção ----
export const SEX_OPTIONS: Opt[] = [
  { value: "MALE", en: "Male", pt: "Masculino" },
  { value: "FEMALE", en: "Female", pt: "Feminino" },
  { value: "OTHER", en: "Other", pt: "Outro" },
];
export const MARITAL_OPTIONS: Opt[] = [
  { value: "SINGLE", en: "Single", pt: "Solteiro(a)" },
  { value: "MARRIED", en: "Married", pt: "Casado(a)" },
  { value: "SEPARATED", en: "Separated", pt: "Separado(a)" },
  { value: "DIVORCED", en: "Divorced", pt: "Divorciado(a)" },
];
export const EDUCATION_OPTIONS: Opt[] = [
  { value: "NONE", en: "None", pt: "Nenhum" },
  { value: "HIGH_SCHOOL", en: "High School", pt: "Ensino Médio" },
  { value: "ASSOCIATES", en: "Associate's", pt: "Tecnólogo" },
  { value: "BACHELORS", en: "Bachelor's", pt: "Graduação" },
  { value: "MASTERS", en: "Master's", pt: "Mestrado" },
  { value: "DOCTORATE", en: "Doctorate", pt: "Doutorado" },
];
export const YESNO_OPTIONS: Opt[] = [
  { value: "YES", en: "Yes", pt: "Sim" },
  { value: "NO", en: "No", pt: "Não" },
];

// ---- tipos de blocos repetíveis ----
export type Employment = {
  employer: string; address: string; city: string; state: string; country: string;
  postal: string; businessType: string; jobTitle: string; startDate: string; endDate: string;
  hoursPerWeek: string; supervisorName: string; supervisorPhone: string; mayContact: YesNo;
  jobDetails: string;
};

export type FamilyMember = {
  relationship: string; nameEnglish: string; placeOfBirth: string; email: string; dob: string;
};

export type UsEntry = { date: string; port: string; visaType: string };
export type UsEntryPerson = { name: string; i94: string; entries: UsEntry[] };
export type SsnRow = { fullName: string; ssn: string; alienNumber: string; visaStatus: string };
export type CountryRow = { name: string; country: string; stays: string; visaType: string };
export type SocialMedia = {
  instagram: string; facebook: string; twitter: string; linkedin: string; youtube: string; tiktok: string;
};

// ---- estrutura completa do G1 ----
export type G1Data = {
  personal: {
    lastName: string; firstName: string; middleName: string; formerName: string;
    sex: string; sexOther: string; maritalStatus: string;
  };
  address: {
    street: string; city: string; state: string; country: string; postal: string;
    phone: string; dob: string; citizenship: string; birthCountry: string;
  };
  emergency: { name: string; relationship: string; phone: string };
  social: SocialMedia;
  education: {
    level: string; majors: string; yearFrom: string; yearTo: string; schoolName: string;
    schoolAddress: string; city: string; state: string; country: string; postal: string; graduated: YesNo;
  };
  currentEmployment: Employment;
  previousEmployments: Employment[];
  additional: { nativeName: string; email: string; interviewLocation: string };
  family: FamilyMember[];
  familyAddress: string;
  spouse: {
    profession: string; education: string; currentEmployer: string; city: string; country: string;
    businessType: string; jobTitle: string; startDate: string; endDate: string; jobDetails: string;
    social: SocialMedia;
  };
  usEntry: { everInUs: YesNo; people: UsEntryPerson[] };
  visaCompliance: {
    currentStatus: string; violatedTerms: YesNo; violatedDetails: string;
    arrested: YesNo; arrestedDetails: string; stayedOver6m: YesNo; stayedDetails: string;
  };
  ssn: SsnRow[];
  greenCard: { history: string; childrenMedicare: YesNo };
  medical: {
    criminalRecord: YesNo; violations: YesNo; violationsDetails: string; impairedDrivingCount: string;
    tb: YesNo; hepatitis: YesNo; hiv: YesNo; otherConditions: YesNo; otherDetails: string;
  };
  countriesLived: { livedAbroad: YesNo; rows: CountryRow[] };
  importantQuestions: {
    incorrectInfo: YesNo; laborCertOrGc: YesNo; deniedEntry: YesNo;
    deported: YesNo; beforeJudge: YesNo; communistParty: YesNo;
  };
  declaration: { agreed: boolean; signature: string; date: string };
};

// ---- fábricas de valores vazios ----
export const emptyEmployment = (): Employment => ({
  employer: "", address: "", city: "", state: "", country: "", postal: "", businessType: "",
  jobTitle: "", startDate: "", endDate: "", hoursPerWeek: "", supervisorName: "", supervisorPhone: "",
  mayContact: "", jobDetails: "",
});
export const emptySocial = (): SocialMedia => ({
  instagram: "", facebook: "", twitter: "", linkedin: "", youtube: "", tiktok: "",
});
const emptyFamily = (relationship: string): FamilyMember => ({
  relationship, nameEnglish: "", placeOfBirth: "", email: "", dob: "",
});
const emptyEntryPerson = (name: string): UsEntryPerson => ({
  name, i94: "", entries: [{ date: "", port: "", visaType: "" }],
});

export function emptyG1(): G1Data {
  return {
    personal: { lastName: "", firstName: "", middleName: "", formerName: "", sex: "", sexOther: "", maritalStatus: "" },
    address: { street: "", city: "", state: "", country: "", postal: "", phone: "", dob: "", citizenship: "", birthCountry: "" },
    emergency: { name: "", relationship: "", phone: "" },
    social: emptySocial(),
    education: { level: "", majors: "", yearFrom: "", yearTo: "", schoolName: "", schoolAddress: "", city: "", state: "", country: "", postal: "", graduated: "" },
    currentEmployment: emptyEmployment(),
    previousEmployments: [emptyEmployment()],
    additional: { nativeName: "", email: "", interviewLocation: "" },
    family: [
      emptyFamily("SPOUSE"), emptyFamily("CHILD #1"), emptyFamily("CHILD #2"), emptyFamily("CHILD #3"),
    ],
    familyAddress: "",
    spouse: {
      profession: "", education: "", currentEmployer: "", city: "", country: "", businessType: "",
      jobTitle: "", startDate: "", endDate: "", jobDetails: "", social: emptySocial(),
    },
    usEntry: {
      everInUs: "",
      people: [
        emptyEntryPerson("PRINCIPAL APPLICANT"), emptyEntryPerson("SPOUSE"),
        emptyEntryPerson("CHILD #1"), emptyEntryPerson("CHILD #2"), emptyEntryPerson("CHILD #3"),
      ],
    },
    visaCompliance: { currentStatus: "", violatedTerms: "", violatedDetails: "", arrested: "", arrestedDetails: "", stayedOver6m: "", stayedDetails: "" },
    ssn: [{ fullName: "", ssn: "", alienNumber: "", visaStatus: "" }],
    greenCard: { history: "", childrenMedicare: "" },
    medical: { criminalRecord: "", violations: "", violationsDetails: "", impairedDrivingCount: "", tb: "", hepatitis: "", hiv: "", otherConditions: "", otherDetails: "" },
    countriesLived: { livedAbroad: "", rows: [{ name: "", country: "", stays: "", visaType: "" }] },
    importantQuestions: { incorrectInfo: "", laborCertOrGc: "", deniedEntry: "", deported: "", beforeJudge: "", communistParty: "" },
    declaration: { agreed: false, signature: "", date: "" },
  };
}

// ---- metadados de campos (labels bilíngues) ----
export const PERSONAL_FIELDS: FieldMeta[] = [
  { key: "lastName", en: "Last Name", pt: "Sobrenome" },
  { key: "firstName", en: "First Name", pt: "Nome" },
  { key: "middleName", en: "Middle Name", pt: "Nome do Meio" },
  { key: "formerName", en: "Former Name (if changed)", pt: "Nome Anterior (se mudou)" },
  { key: "sex", en: "Sex", pt: "Sexo", type: "radio", options: SEX_OPTIONS },
  { key: "maritalStatus", en: "Marital Status", pt: "Estado Civil", type: "radio", options: MARITAL_OPTIONS },
];

export const ADDRESS_FIELDS: FieldMeta[] = [
  { key: "street", en: "Street", pt: "Rua" },
  { key: "city", en: "City", pt: "Cidade" },
  { key: "state", en: "State / Province", pt: "Estado / Província" },
  { key: "country", en: "Country", pt: "País" },
  { key: "postal", en: "Postal Code", pt: "CEP / Código Postal" },
  { key: "phone", en: "Phone Number", pt: "Número de Telefone" },
  { key: "dob", en: "Date of Birth (MM/DD/YYYY)", pt: "Data de Nascimento", type: "date" },
  { key: "citizenship", en: "Country of Citizenship", pt: "País de Cidadania" },
  { key: "birthCountry", en: "Country of Birth", pt: "País de Nascimento" },
];

export const EMERGENCY_FIELDS: FieldMeta[] = [
  { key: "name", en: "Name for Emergency", pt: "Nome para Emergência" },
  { key: "relationship", en: "Relationship", pt: "Parentesco / Relação" },
  { key: "phone", en: "Telephone for Emergency", pt: "Telefone para Emergência" },
];

export const SOCIAL_FIELDS: FieldMeta[] = [
  { key: "instagram", en: "Instagram", pt: "Instagram" },
  { key: "facebook", en: "Facebook", pt: "Facebook" },
  { key: "twitter", en: "Twitter / X", pt: "Twitter / X" },
  { key: "linkedin", en: "LinkedIn", pt: "LinkedIn" },
  { key: "youtube", en: "YouTube", pt: "YouTube" },
  { key: "tiktok", en: "TikTok", pt: "TikTok" },
];

export const EDUCATION_FIELDS: FieldMeta[] = [
  { key: "level", en: "Education (Highest Level)", pt: "Nível de Educação", type: "radio", options: EDUCATION_OPTIONS },
  { key: "majors", en: "Specific Major Field(s) of Study", pt: "Área(s) de Especialização" },
  { key: "yearFrom", en: "Education completed — From", pt: "Formação — De" },
  { key: "yearTo", en: "Education completed — To", pt: "Formação — Até" },
  { key: "schoolName", en: "School Name", pt: "Nome da Escola / Faculdade" },
  { key: "schoolAddress", en: "School Address", pt: "Endereço da Escola" },
  { key: "city", en: "City", pt: "Cidade" },
  { key: "state", en: "State / Province", pt: "Estado / Província" },
  { key: "country", en: "Country", pt: "País" },
  { key: "postal", en: "Postal Code", pt: "CEP / Código Postal" },
  { key: "graduated", en: "Graduated?", pt: "Se formou?", type: "radio", options: YESNO_OPTIONS },
];

export const EMPLOYMENT_FIELDS: FieldMeta[] = [
  { key: "employer", en: "Employer / Company Name", pt: "Nome do Empregador / Empresa" },
  { key: "address", en: "Address", pt: "Endereço" },
  { key: "city", en: "City", pt: "Cidade" },
  { key: "state", en: "State / Province", pt: "Estado / Província" },
  { key: "country", en: "Country", pt: "País" },
  { key: "postal", en: "Postal Code", pt: "CEP / Código Postal" },
  { key: "businessType", en: "Type of Business", pt: "Tipo de Negócio / Setor" },
  { key: "jobTitle", en: "Job Title", pt: "Cargo / Função" },
  { key: "startDate", en: "Start Date (MM/DD/YYYY)", pt: "Data de Início", type: "date" },
  { key: "endDate", en: "End Date (MM/DD/YYYY)", pt: "Data de Término", type: "date" },
  { key: "hoursPerWeek", en: "Hours Worked per Week", pt: "Horas Trabalhadas por Semana" },
  { key: "supervisorName", en: "Employer / Supervisor Name", pt: "Nome do Supervisor / Representante" },
  { key: "supervisorPhone", en: "Phone of Employer / Supervisor", pt: "Telefone do Empregador / Supervisor" },
  { key: "mayContact", en: "May we contact your employer?", pt: "Podemos contatar seu empregador?", type: "radio", options: YESNO_OPTIONS },
];

export const ADDITIONAL_FIELDS: FieldMeta[] = [
  { key: "nativeName", en: "Name in Native Language", pt: "Nome no Idioma Nativo" },
  { key: "email", en: "E-mail (required)", pt: "E-mail (obrigatório)" },
  { key: "interviewLocation", en: "Preferred Interview Location", pt: "Local Preferencial para Entrevista" },
];

export const FAMILY_COLUMNS: FieldMeta[] = [
  { key: "nameEnglish", en: "Name in English", pt: "Nome em Inglês" },
  { key: "placeOfBirth", en: "Place of Birth (City & Country)", pt: "Local de Nascimento" },
  { key: "email", en: "Email", pt: "E-mail" },
  { key: "dob", en: "Date of Birth (MM/DD/YYYY)", pt: "Data de Nascimento", type: "date" },
];

export const SPOUSE_FIELDS: FieldMeta[] = [
  { key: "profession", en: "Profession", pt: "Profissão" },
  { key: "education", en: "Education (Highest Level)", pt: "Nível de Educação", type: "radio", options: EDUCATION_OPTIONS },
  { key: "currentEmployer", en: "Current Employer", pt: "Empregador Atual" },
  { key: "city", en: "City of Employment", pt: "Cidade de Trabalho" },
  { key: "country", en: "Country of Employment", pt: "País de Trabalho" },
  { key: "businessType", en: "Type of Business", pt: "Tipo de Negócio" },
  { key: "jobTitle", en: "Job Title", pt: "Cargo / Função" },
  { key: "startDate", en: "Start Date (MM/DD/YYYY)", pt: "Data de Início", type: "date" },
  { key: "endDate", en: "End Date (MM/DD/YYYY)", pt: "Data de Término", type: "date" },
];

export const SSN_COLUMNS: FieldMeta[] = [
  { key: "fullName", en: "Full Name", pt: "Nome Completo" },
  { key: "ssn", en: "SSN #", pt: "SSN #" },
  { key: "alienNumber", en: "Alien Number", pt: "Número de Estrangeiro" },
  { key: "visaStatus", en: "Visa Status", pt: "Status do Visto" },
];

export const COUNTRY_COLUMNS: FieldMeta[] = [
  { key: "name", en: "Name", pt: "Nome" },
  { key: "country", en: "Country", pt: "País" },
  { key: "stays", en: "Stays (MM/DD/YYYY – MM/DD/YYYY)", pt: "Período" },
  { key: "visaType", en: "Visa Type", pt: "Tipo de Visto" },
];

export const ENTRY_COLUMNS: FieldMeta[] = [
  { key: "date", en: "Entry (MM/DD/YYYY)", pt: "Entrada", type: "date" },
  { key: "port", en: "Port of Entry", pt: "Porto de Entrada" },
  { key: "visaType", en: "Visa / Immigration Type", pt: "Tipo de Visto / Imigração" },
];

// Perguntas "sim/não" da seção 4 (visto) e da seção "Perguntas importantes".
export const IMPORTANT_QUESTIONS: { key: keyof G1Data["importantQuestions"]; en: string; pt: string }[] = [
  { key: "incorrectInfo", en: "Have you ever submitted incorrect information to U.S. Embassy, Consulate or CIS?", pt: "Você já forneceu informações incorretas à Embaixada, Consulado ou ao CIS dos EUA?" },
  { key: "laborCertOrGc", en: "Have you ever applied for a Labor Certification or Green Card?", pt: "Você já solicitou Certificação de Trabalho ou Green Card?" },
  { key: "deniedEntry", en: "Have you ever been denied entry to the U.S.?", pt: "Você já teve entrada negada nos EUA?" },
  { key: "deported", en: "Have you ever been deported or told to leave the U.S.?", pt: "Você já foi deportado(a) ou mandado(a) a deixar os EUA?" },
  { key: "beforeJudge", en: "Have you ever been before an Immigration Judge?", pt: "Você já compareceu perante um Juiz de Imigração?" },
  { key: "communistParty", en: "Are you an active member of the Communist Party or any other totalitarian organization?", pt: "Você é membro ativo do Partido Comunista ou de organização totalitária?" },
];

// Cláusulas da declaração final (exibidas e aceitas).
export const DECLARATION_CLAUSES: { en: string; pt: string }[] = [
  { en: "I declare that I pledge to work for my SPONSOR on a permanent basis.", pt: "Declaro que me comprometo a trabalhar para o meu PATROCINADOR em caráter permanente." },
  { en: "I clearly understand that depending on a U.S. officer's discretion, my age could become an issue and that there is a risk of becoming ineligible for permanent residency.", pt: "Estou ciente de que, a critério do oficial americano, minha idade pode se tornar um obstáculo e que há risco de inelegibilidade para a residência permanente." },
  { en: "I clearly understand that my children may be subject to an age-out issue if they reach 21 while the application is being processed.", pt: "Estou ciente de que meus filhos podem estar sujeitos ao 'age-out' caso completem 21 anos durante o processo." },
  { en: "I certify that all the information given above is true and correct. False or misleading information may result in refusal of my immigration application.", pt: "Certifico que todas as informações são verdadeiras e corretas. Informações falsas ou enganosas podem resultar na recusa do pedido." },
  { en: "I understand that employment with this company is 'at will'.", pt: "Entendo que o emprego nesta empresa é 'at will' (vontade livre)." },
  { en: "I hereby authorize Global Express Recruiting (GER) to conduct any background checks it deems necessary, in the U.S. and internationally.", pt: "Autorizo a Global Express Recruiting (GER) a realizar verificações de antecedentes que considere necessárias, nos EUA e internacionalmente." },
];

// Rótulo bilíngue compacto ("EN / PT") para usar em labels.
export function bi(f: { en: string; pt: string }): string {
  return `${f.en} / ${f.pt}`;
}

// Rótulo de uma opção pelo value (para PDF/admin).
export function optLabel(options: Opt[], value: string): string {
  const o = options.find((x) => x.value === value);
  return o ? `${o.en} / ${o.pt}` : value || "—";
}
