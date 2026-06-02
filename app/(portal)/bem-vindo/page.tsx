import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/Icon";
import { requireUser } from "@/lib/guards";

// Tela de boas-vindas pós-cadastro.
export default async function WelcomePage() {
  const user = await requireUser();
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] || "";
  const t = await getTranslations("welcome");

  return (
    <div className="welcome">
      <div className="welcome__badge">
        <Icon n="confetti" />
      </div>
      <h1>{t("title", { name: firstName ? `, ${firstName}` : "" })}</h1>
      <p className="welcome__lead">{t("lead")}</p>

      <div className="welcome__cards">
        <div className="stepcard">
          <div className="stepcard__n">1</div>
          <h4>{t("step1Title")}</h4>
          <p>{t("step1Text")}</p>
        </div>
        <div className="stepcard">
          <div className="stepcard__n">2</div>
          <h4>{t("step2Title")}</h4>
          <p>{t("step2Text")}</p>
        </div>
        <div className="stepcard">
          <div className="stepcard__n">3</div>
          <h4>{t("step3Title")}</h4>
          <p>{t("step3Text")}</p>
        </div>
      </div>

      <div className="welcome__actions">
        <Link className="btn btn--primary btn--lg" href="/vagas">
          <Icon n="briefcase" /> {t("ctaJobs")}
        </Link>
        <Link className="btn btn--ghost btn--lg" href="/meu-processo">
          <Icon n="route" /> {t("ctaProcess")}
        </Link>
      </div>
    </div>
  );
}
