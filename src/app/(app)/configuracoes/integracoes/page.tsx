import type { Metadata } from "next";

import { IntegracoesView } from "@/components/configuracoes/integracoes-view";
import { integracoes } from "@/services/configuracoes";

export const metadata: Metadata = {
  title: "Integrações",
};

export default function IntegracoesPage() {
  return <IntegracoesView itens={integracoes} />;
}
