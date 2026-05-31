"use client";

import { Icon } from "./Icon";
import { passwordChecks } from "@/lib/util";

const TIER_LABEL = { weak: "Senha fraca", medium: "Senha média", strong: "Senha forte" } as const;

// Medidor de força da senha, seguindo a identidade visual (cores de status).
export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const c = passwordChecks(value);
  const filled = c.tier === "weak" ? 1 : c.tier === "medium" ? 2 : 3;

  const reqs: { ok: boolean; label: string }[] = [
    { ok: c.len, label: "8+ caracteres" },
    { ok: c.upper, label: "1 maiúscula" },
    { ok: c.num, label: "1 número" },
    { ok: c.special, label: "1 especial" },
  ];

  return (
    <div className="pwmeter">
      <div className="pwmeter__bars">
        {[0, 1, 2].map((i) => (
          <span key={i} className={"pwmeter__bar" + (i < filled ? ` is-on t-${c.tier}` : "")} />
        ))}
      </div>
      <div className={`pwmeter__label t-${c.tier}`}>{TIER_LABEL[c.tier]}</div>
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
