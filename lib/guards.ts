import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Garante que há um usuário logado; senão manda para o login.
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

// Garante que o usuário logado é da equipe (ADMIN).
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/vagas");
  return user;
}
