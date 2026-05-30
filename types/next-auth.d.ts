import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Adiciona id e role à sessão/token do Auth.js.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
