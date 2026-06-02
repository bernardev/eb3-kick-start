"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { LocaleToggle } from "./LocaleToggle";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/util";
import type { Role } from "@prisma/client";

type NavItem = { href: string; icon: string; labelKey: string; match: (p: string) => boolean };

const CLIENT_NAV: NavItem[] = [
  { href: "/vagas", icon: "briefcase", labelKey: "jobsEb3", match: (p) => p === "/vagas" || p.startsWith("/vagas/") },
  { href: "/outras-vagas", icon: "world-search", labelKey: "otherJobs", match: (p) => p.startsWith("/outras-vagas") },
  { href: "/meu-processo", icon: "route", labelKey: "myProcess", match: (p) => p.startsWith("/meu-processo") },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", icon: "layout-grid", labelKey: "cases", match: (p) => p === "/admin" || p.startsWith("/admin/casos") },
  { href: "/admin/candidaturas", icon: "send", labelKey: "applications", match: (p) => p.startsWith("/admin/candidaturas") },
  { href: "/admin/vagas", icon: "briefcase", labelKey: "jobs", match: (p) => p.startsWith("/admin/vagas") },
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
  const t = useTranslations("nav");
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
            <Icon n={it.icon} /> {t(it.labelKey)}
          </Link>
        ))}
      </nav>

      <div className="appbar__right">
        <LocaleToggle />
        <div className="userpill">
          <span className="avatar">
            {image ? <img src={image} alt="" /> : initials(name)}
          </span>
          <div>
            <div className="userpill__name">{name}</div>
            <div className="userpill__role">{isAdmin ? t("roleTeam") : t("roleCandidate")}</div>
          </div>
        </div>
        <form action={signOutAction}>
          <button className="iconbtn-light" title={t("logout")} type="submit">
            <Icon n="logout" />
          </button>
        </form>
      </div>
    </header>
  );
}
