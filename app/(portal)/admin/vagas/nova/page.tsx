import Link from "next/link";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { JobForm } from "@/components/JobForm";

// Cadastro de nova vaga EB-3.
export default async function NovaVagaPage() {
  await requireAdmin();

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/admin/vagas">Vagas</Link> <Icon n="chevron-right" /> <span>Nova vaga</span>
      </div>
      <div className="pagehead">
        <div>
          <div className="kicker">Painel da equipe</div>
          <h1>Nova vaga EB-3</h1>
          <p>Preencha os dados e defina as perguntas do questionário.</p>
        </div>
      </div>
      <JobForm />
    </div>
  );
}
