import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("footer");

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
                <a href="#">{t("terms")}</a>
                <a href="#">{t("privacy")}</a>
                <a href="https://kick-start.us" target="_blank" rel="noopener noreferrer">
                  kick-start.us
                </a>
              </div>
              <div className="footer__copy">{t("copy")}</div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
