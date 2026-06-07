"use server";

import { randomBytes, createHash } from "node:crypto";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail, sendGoogleAccountNoticeEmail } from "@/lib/email";

export type PasswordState = { ok?: boolean; error?: string };

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

function appBase() {
  return (process.env.AUTH_URL || "https://eb3.kick-start.us").replace(/\/$/, "");
}

const strongPassword = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial.");

// Passo 1: pede o reset. Sempre responde de forma genérica (não revela se a
// conta existe). Conta que entra com Google recebe um aviso em vez de link.
export async function requestPasswordReset(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const parsed = z.string().email().safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { error: "Informe um e-mail válido." };

  const email = parsed.data.toLowerCase();
  const locale = (await getLocale()) === "en" ? "en" : "pt";
  const base = appBase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    try {
      if (user.passwordHash) {
        const token = randomBytes(32).toString("hex");
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
        await prisma.passwordResetToken.create({
          data: {
            tokenHash: sha256(token),
            userId: user.id,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
          },
        });
        await sendPasswordResetEmail(user.email, `${base}/redefinir-senha?token=${token}`, locale);
      } else {
        // Conta só com Google (sem senha).
        await sendGoogleAccountNoticeEmail(user.email, `${base}/login`, locale);
      }
    } catch (err) {
      console.error("[EB-3] Falha ao enviar e-mail de reset:", err);
    }
  }

  // Resposta genérica em qualquer caso.
  return { ok: true };
}

// Passo 2: redefine a senha a partir do token do e-mail.
export async function resetPassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "Link inválido. Solicite a redefinição novamente." };

  const pw = strongPassword.safeParse(String(formData.get("password") ?? ""));
  if (!pw.success) return { error: pw.error.issues[0].message };

  const rec = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!rec || rec.expiresAt < new Date()) {
    return { error: "Link inválido ou expirado. Solicite a redefinição novamente." };
  }

  const passwordHash = await bcrypt.hash(pw.data, 10);
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: rec.userId } });

  return { ok: true };
}
