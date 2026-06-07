import { ResetPasswordForm } from "@/components/ResetPasswordForm";

// Tela de redefinição de senha (pública, acessada pelo link do e-mail).
export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="app">
      <div className="authsolo">
        <ResetPasswordForm token={token ?? ""} />
      </div>
    </div>
  );
}
