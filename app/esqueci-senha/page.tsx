import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

// Tela "Esqueci minha senha" (pública).
export default async function EsqueciSenhaPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "ADMIN" ? "/admin" : "/vagas");
  return (
    <div className="app">
      <div className="authsolo">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
