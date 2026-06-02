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
import { navFor } from "@/lib/nav";
import type { Role } from "@prisma/client";

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
  const items = navFor(role);

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
