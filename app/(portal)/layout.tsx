import { Logo } from "@/components/Logo";
import { AppBar } from "@/components/AppBar";
import { requireUser } from "@/lib/guards";

// Layout das páginas autenticadas: header (appbar) + conteúdo + rodapé.
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="app">
      <AppBar name={user.name ?? "Usuário"} role={user.role} image={user.image} />
      <div className="shell">
        <main className="main">
          {children}
          <footer className="footer">
            <div className="footer__in">
              <Logo className="footer__logo" />
              <div className="footer__links">
                <a href="#">Termos de Uso</a>
                <a href="#">Privacidade</a>
                <a href="https://kick-start.us" target="_blank" rel="noopener noreferrer">
                  kick-start.us
                </a>
              </div>
              <div className="footer__copy">© 2026 Kick Start · Patrocínio de visto EB-3</div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
