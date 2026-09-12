import type { Metadata } from "next";

import { HistoricoEnviosWorkspace } from "@/components/integracoes/historico-workspace";

export const metadata: Metadata = {
  title: "Histórico de envios",
};

export default function IntegracoesHistoricoPage() {
  return <HistoricoEnviosWorkspace />;
}
