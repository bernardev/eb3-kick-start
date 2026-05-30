import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Raiz: encaminha conforme a sessão e o papel do usuário.
export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  redirect("/vagas");
}
