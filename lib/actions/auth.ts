"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";

export type AuthFormState = { error?: string };

// Encerra a sessão e volta para o login.
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

// "Continuar com Google".
export async function googleSignIn() {
  await signIn("google", { redirectTo: "/" });
}

const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(1, "Informe sua senha."),
});

// Login por email/senha. Em sucesso, o signIn redireciona.
export async function loginWithCredentials(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Email ou senha incorretos." };
    }
    throw e; // deixa o redirect de sucesso seguir
  }
}

// Senha forte: 8+ caracteres, ao menos 1 maiúscula, 1 número e 1 especial.
const strongPassword = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial.");

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo."),
  email: z.string().email("Informe um email válido."),
  password: strongPassword,
});

// Cadastro gratuito por email/senha. Cria a conta e já loga, indo para a
// tela de boas-vindas.
export async function registerUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com este email. Tente entrar." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { name: parsed.data.name, email, passwordHash, role: "CLIENT" },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/bem-vindo",
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Conta criada, mas houve um erro ao entrar. Tente fazer login." };
    }
    throw e;
  }
}
