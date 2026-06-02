"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { navFor } from "@/lib/nav";
import type { Role } from "@prisma/client";

// Barra de navegação inferior — aparece apenas no mobile (controlado por CSS).
export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname() ?? "";
  const t = useTranslations("nav");
  const items = navFor(role);

  return (
    <nav className="bottomnav" aria-label="Navegação">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={"bottomnav__item" + (it.match(pathname) ? " is-active" : "")}
        >
          <Icon n={it.icon} />
          <span>{t(it.labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
}
