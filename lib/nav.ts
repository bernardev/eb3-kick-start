import type { Role } from "@prisma/client";

// Itens de navegação (compartilhados entre o header e a barra inferior mobile).
// labelKey = chave em messages "nav.*". shortKey = rótulo curto para o mobile.
export type NavItem = {
  href: string;
  icon: string;
  labelKey: string;
  match: (p: string) => boolean;
};

export const CLIENT_NAV: NavItem[] = [
  { href: "/vagas", icon: "briefcase", labelKey: "jobsEb3", match: (p) => p === "/vagas" || p.startsWith("/vagas/") },
  { href: "/outras-vagas", icon: "world-search", labelKey: "otherJobs", match: (p) => p.startsWith("/outras-vagas") },
  { href: "/meu-processo", icon: "route", labelKey: "myProcess", match: (p) => p.startsWith("/meu-processo") },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", icon: "layout-grid", labelKey: "cases", match: (p) => p === "/admin" || p.startsWith("/admin/casos") },
  { href: "/admin/candidaturas", icon: "send", labelKey: "applications", match: (p) => p.startsWith("/admin/candidaturas") },
  { href: "/admin/vagas", icon: "briefcase", labelKey: "jobs", match: (p) => p.startsWith("/admin/vagas") },
];

export function navFor(role: Role): NavItem[] {
  return role === "ADMIN" ? ADMIN_NAV : CLIENT_NAV;
}
