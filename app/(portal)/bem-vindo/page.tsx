import Link from "next/link";
import { Icon } from "@/components/Icon";
import { requireUser } from "@/lib/guards";

// Tela de boas-vindas pós-cadastro.
export default async function WelcomePage() {
  const user = await requireUser();
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] || "";

  return (
    <div className="welcome">
      <div className="welcome__badge">
        <Icon n="confetti" />
      </div>
      <h1>Conta criada{firstName ? `, ${firstName}` : ""}! 🎉</h1>
      <p className="welcome__lead">
        Seu acesso gratuito está liberado. Veja como funciona a sua jornada com a Kick Start até o
        Green Card.
      </p>

      <div className="welcome__cards">
        <div className="stepcard">
          <div className="stepcard__n">1</div>
          <h4>Explore as vagas EB-3</h4>
          <p>Veja posições com patrocínio de visto e candidate-se às que combinam com você.</p>
        </div>
        <div className="stepcard">
          <div className="stepcard__n">2</div>
          <h4>Seja selecionado</h4>
          <p>Passe pela triagem e entrevista. Nós conectamos você ao empregador certo.</p>
        </div>
        <div className="stepcard">
          <div className="stepcard__n">3</div>
          <h4>Acompanhe seu processo</h4>
          <p>Siga cada fase do visto em tempo real no portal &quot;Meu Processo EB-3&quot;.</p>
        </div>
      </div>

      <div className="welcome__actions">
        <Link className="btn btn--primary btn--lg" href="/vagas">
          <Icon n="briefcase" /> Ver vagas EB-3
        </Link>
        <Link className="btn btn--ghost btn--lg" href="/meu-processo">
          <Icon n="route" /> Meu processo
        </Link>
      </div>
    </div>
  );
}
