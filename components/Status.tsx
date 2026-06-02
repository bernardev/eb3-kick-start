"use client";

import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { STATUS, type StatusKey } from "@/lib/status";

// Badge de status (pílula colorida). withDot usa um ponto no lugar do ícone.
export function StatusBadge({ status, withDot }: { status: StatusKey; withDot?: boolean }) {
  const t = useTranslations("status");
  const c = STATUS[status] ?? STATUS.none;
  return (
    <span className={`badge badge--${status}`}>
      {withDot ? <span className="ico-dot" /> : <Icon n={c.icon} />}
      {t(status)}
    </span>
  );
}

// Ponto de status (usado nas sub-etapas em modo leitura).
export function StatusDot({ status }: { status: StatusKey }) {
  return <span className={`dot dot--${status}`} />;
}
