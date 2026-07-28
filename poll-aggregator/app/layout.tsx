import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apuração Contínua — Agregador de Pesquisas Eleitorais",
  description:
    "Agregador automático de pesquisas eleitorais a partir de dados abertos da Wikipédia. Cole o link de qualquer eleição e acompanhe a tendência.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
