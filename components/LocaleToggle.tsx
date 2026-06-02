"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/actions/locale";
import type { Locale } from "@/i18n/config";

// Seletor PT/EN no header (salva em cookie e recarrega).
export function LocaleToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (l: Locale) => {
    if (l === locale || pending) return;
    startTransition(async () => {
      await setLocale(l);
      router.refresh();
    });
  };

  return (
    <div className="langtoggle" role="group" aria-label="Idioma / Language">
      {(["pt", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          className={"langtoggle__btn" + (locale === l ? " is-active" : "")}
          onClick={() => choose(l)}
          disabled={pending}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
