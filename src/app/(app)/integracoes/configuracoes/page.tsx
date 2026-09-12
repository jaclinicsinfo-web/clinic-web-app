import type { Metadata } from "next";

import { IntegracoesConfiguracoesWorkspace } from "@/components/integracoes/configuracoes-workspace";

export const metadata: Metadata = {
  title: "Configurações de integrações",
};

export default function IntegracoesConfiguracoesPage() {
  return <IntegracoesConfiguracoesWorkspace />;
}
