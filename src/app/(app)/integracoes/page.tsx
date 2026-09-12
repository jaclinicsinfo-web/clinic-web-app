import type { Metadata } from "next";

import { IntegracoesWorkspace } from "@/components/integracoes/integracoes-workspace";

export const metadata: Metadata = {
  title: "Integrações e lembretes",
};

export default function IntegracoesPage() {
  return <IntegracoesWorkspace />;
}
