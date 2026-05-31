/* ============================================================
   KICK START — Portal EB-3 · limpeza dos dados de teste
   Remove os usuários/casos criados pelo seed (cascateia casos,
   fases, sub-etapas e aplicações) e garante um admin genérico.
   NÃO mexe nas vagas nem em usuários que você criou.

   Uso:
     npm run db:cleanup
   Opcional (definir credenciais do admin):
     ADMIN_EMAIL="admin@kick-start.us" ADMIN_PASSWORD="SuaSenha@1" npm run db:cleanup
   ============================================================ */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// E-mails criados pelo seed de exemplo (serão removidos).
const SEED_EMAILS = [
  "daia@kick-start.us",
  "eduardo@example.com",
  "mariana@example.com",
  "daniel@example.com",
  "lucia@example.com",
  "joao@example.com",
  "ana@example.com",
  "carlos@example.com",
];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@kick-start.us").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Kickstart@2026";

  console.log("→ Removendo usuários/casos de teste do seed…");
  const del = await prisma.user.deleteMany({ where: { email: { in: SEED_EMAILS } } });
  console.log(`  ${del.count} usuário(s) de teste removido(s) (casos e aplicações em cascata).`);

  console.log(`→ Garantindo admin genérico (${adminEmail})…`);
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: { email: adminEmail, name: "Equipe Kick Start", role: "ADMIN", passwordHash },
  });

  console.log("✓ Limpeza concluída.");
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  console.log("  (troque a senha do admin depois, em produção)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
