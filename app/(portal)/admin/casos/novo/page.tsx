import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Icon } from "@/components/Icon";
import { createCase } from "@/lib/actions/cases";

export const dynamic = "force-dynamic";

// Abertura manual de um caso para um cliente que ainda não tem processo.
export default async function NovoCasoPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  await requireAdmin();
  const { userId } = await searchParams;

  // Clientes sem caso aberto (elegíveis).
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", case: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="container container--wide">
      <div className="crumbs">
        <Link href="/admin">Casos</Link> <Icon n="chevron-right" /> <span>Novo caso</span>
      </div>
      <div className="pagehead">
        <div>
          <div className="kicker">Painel da equipe</div>
          <h1>Abrir novo caso</h1>
          <p>Vincule um cliente para começar a acompanhar o processo EB-3 dele.</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__ic">
              <Icon n="users" />
            </div>
            <h3>Nenhum cliente disponível</h3>
            <p>Todos os clientes já têm caso aberto, ou ainda não há clientes cadastrados.</p>
          </div>
        </div>
      ) : (
        <form action={createCase}>
          <div className="card formcard">
            <h3>Dados do caso</h3>
            <div className="field">
              <label className="field__label">Cliente</label>
              <div className="select">
                <select name="userId" defaultValue={userId ?? ""} required>
                  <option value="" disabled>
                    Selecione um cliente…
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? "Sem nome"} — {c.email}
                    </option>
                  ))}
                </select>
                <Icon n="selector" />
              </div>
            </div>

            <div className="formgrid">
              <div className="field">
                <label className="field__label">Nº do caso (opcional)</label>
                <input className="input" name="caseNo" placeholder="Gerado automaticamente (KS-2026-####)" />
              </div>
              <div className="field">
                <label className="field__label">Origem / país (opcional)</label>
                <input className="input" name="country" placeholder="Brasil" />
              </div>
              <div className="field">
                <label className="field__label">Case manager (opcional)</label>
                <input className="input" name="manager" placeholder="Daia" />
              </div>
              <div className="field">
                <label className="field__label">Vaga vinculada (opcional)</label>
                <input className="input" name="jobLabel" placeholder="Auxiliar de Cozinha · Blue Ridge Hospitality" />
              </div>
            </div>
          </div>

          <div className="formactions">
            <button className="btn btn--primary btn--lg" type="submit">
              <Icon n="plus" /> Abrir caso
            </button>
            <Link className="btn btn--ghost" href="/admin">
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
