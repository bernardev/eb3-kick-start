import { getTranslations } from "next-intl/server";
import { Icon } from "./Icon";
import { whatsappLink } from "@/lib/support";

// CTA "Não está pronto para aplicar?" → leva ao WhatsApp de atendimento.
export async function SupportCta() {
  const t = await getTranslations("support");
  return (
    <div className="supportcta">
      <span>{t("notReady")}</span>
      <a
        className="btn btn--wa btn--sm"
        href={whatsappLink(t("prefill"))}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon n="brand-whatsapp" /> {t("talkWhatsapp")}
      </a>
    </div>
  );
}
