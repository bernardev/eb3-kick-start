import type { Metadata } from "next";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kick Start — Portal EB-3",
  description:
    "Vagas com patrocínio de visto EB-3 e acompanhamento do seu processo de Green Card, do início à aprovação.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
