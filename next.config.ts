import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagens externas (avatares do Google) usadas no perfil do usuário.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // O lint roda via `npm run lint`; não bloqueia o build de produção.
  // A checagem de tipos (TypeScript) permanece ativa no build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
