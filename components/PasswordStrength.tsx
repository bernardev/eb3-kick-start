"use client";

import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { passwordChecks } from "@/lib/util";

// Medidor de força da senha, seguindo a identidade visual (cores de status).
export function PasswordStrength({ value }: { value: string }) {
  const t = useTranslations("password");
  if (!value) return null;
  const c = passwordChecks(value);
  const filled = c.tier === "weak" ? 1 : c.tier === "medium" ? 2 : 3;
  const tierLabel = c.tier === "weak" ? t("weak") : c.tier === "medium" ? t("medium") : t("strong");

  const reqs: { ok: boolean; label: string }[] = [
    { ok: c.len, label: t("req8") },
    { ok: c.upper, label: t("reqUpper") },
    { ok: c.num, label: t("reqNumber") },
    { ok: c.special, label: t("reqSpecial") },
  ];

  return (
    <div className="pwmeter">
      <div className="pwmeter__bars">
        {[0, 1, 2].map((i) => (
          <span key={i} className={"pwmeter__bar" + (i < filled ? ` is-on t-${c.tier}` : "")} />
        ))}
      </div>
      <div className={`pwmeter__label t-${c.tier}`}>{tierLabel}</div>
      <ul className="pwreqs">
        {reqs.map((r) => (
          <li key={r.label} className={r.ok ? "ok" : ""}>
            <Icon n={r.ok ? "check" : "circle"} /> {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
