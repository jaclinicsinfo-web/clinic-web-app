import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { SessaoProvider } from "@/hooks/use-sessao";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "J.A. Clinics — Gestão de Clínicas",
    template: "%s · J.A. Clinics",
  },
  description:
    "ERP para gestão administrativa de clínicas: pacientes, agenda, prontuário, financeiro, convênios e relatórios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <SessaoProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </SessaoProvider>
      </body>
    </html>
  );
}
