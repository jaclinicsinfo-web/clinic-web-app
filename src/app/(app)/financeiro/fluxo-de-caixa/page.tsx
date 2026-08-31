import type { Metadata } from "next";

import { FluxoCaixaWorkspace } from "@/components/financeiro/fluxo-caixa-workspace";

export const metadata: Metadata = {
  title: "Fluxo de caixa",
};

export default function FluxoDeCaixaPage() {
  return <FluxoCaixaWorkspace />;
}
