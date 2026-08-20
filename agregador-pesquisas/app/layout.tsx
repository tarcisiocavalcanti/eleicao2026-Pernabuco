import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel de Pesquisas — PE & Brasil",
  description: "Agregador de pesquisas eleitorais de Pernambuco e do Brasil",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
