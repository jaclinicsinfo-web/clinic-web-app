import type { Metadata } from "next";

import { LembretesWorkspace } from "@/components/integracoes/lembretes-workspace";

export const metadata: Metadata = {
  title: "Regras de lembretes",
};

export default function IntegracoesLembretesPage() {
  return <LembretesWorkspace />;
}
