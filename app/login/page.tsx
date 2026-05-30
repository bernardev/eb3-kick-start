import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

// Tela de acesso (cadastro/login). Quem já está logado é redirecionado.
export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/vagas");
  }
  return (
    <div className="app">
      <AuthForm />
    </div>
  );
}
