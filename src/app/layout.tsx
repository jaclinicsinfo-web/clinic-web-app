import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { SessaoProvider } from "@/hooks/use-sessao";
import { TemaProvider } from "@/hooks/use-tema";
import { ThemedToaster } from "@/components/layout/themed-toaster";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const temaScript = `(function(){try{var t=localStorage.getItem("clinicerp.tema");if(t==="escuro"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.style.colorScheme="light"}}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "J.A. Clinics — Gestão de Clínicas",
    template: "%s · J.A. Clinics",
  },
  description:
    "ERP para gestão administrativa de clínicas: pacientes, agenda, prontuário, financeiro, convênios e relatórios.",
  icons: {
    icon: "/brand/marca-ja-clinics.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "J.A. Clinics",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#101828" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaScript }} />
      </head>
      <body className="flex h-full min-h-0 flex-col overflow-x-clip">
        <TemaProvider>
          <SessaoProvider>
            {children}
            <ThemedToaster />
          </SessaoProvider>
        </TemaProvider>
      </body>
    </html>
  );
}
