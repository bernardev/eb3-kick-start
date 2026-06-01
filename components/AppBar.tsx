"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/util";
import type { Role } from "@prisma/client";

type NavItem = { href: string; icon: string; label: string; match: (p: string) => boolean };

const CLIENT_NAV: NavItem[] = [
  { href: "/vagas", icon: "briefcase", label: "Vagas EB-3", match: (p) => p === "/vagas" || p.startsWith("/vagas/") },
  { href: "/outras-vagas", icon: "world-search", label: "Outras vagas", match: (p) => p.startsWith("/outras-vagas") },
  { href: "/meu-processo", icon: "route", label: "Meu Processo", match: (p) => p.startsWith("/meu-processo") },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", icon: "layout-grid", label: "Casos", match: (p) => p === "/admin" || p.startsWith("/admin/casos") },
  { href: "/admin/candidaturas", icon: "send", label: "Candidaturas", match: (p) => p.startsWith("/admin/candidaturas") },
  { href: "/admin/vagas", icon: "briefcase", label: "Vagas", match: (p) => p.startsWith("/admin/vagas") },
];

export function AppBar({
  name,
  role,
  image,
}: {
  name: string;
  role: Role;
  image?: string | null;
}) {
  const pathname = usePathname() ?? "";
  const isAdmin = role === "ADMIN";
  const items = isAdmin ? ADMIN_NAV : CLIENT_NAV;

  return (
    <header className="appbar">
      <Logo className="appbar__logo" />
      <nav className="appbar__nav">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={"navtab" + (it.match(pathname) ? " is-active" : "")}
          >
            <Icon n={it.icon} /> {it.label}
          </Link>
        ))}
      </nav>

      <div className="appbar__right">
        <div className="userpill">
          <span className="avatar">
            {image ? <img src={image} alt="" /> : initials(name)}
          </span>
          <div>
            <div className="userpill__name">{name}</div>
            <div className="userpill__role">{isAdmin ? "Kick Start Team" : "Candidato"}</div>
          </div>
        </div>
        <form action={signOutAction}>
          <button className="iconbtn-light" title="Sair" type="submit">
            <Icon n="logout" />
          </button>
        </form>
      </div>
    </header>
  );
}
