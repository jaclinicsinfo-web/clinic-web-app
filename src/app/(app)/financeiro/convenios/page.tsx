import type { Metadata } from "next";

import { LotesConvenioWorkspace } from "@/components/financeiro/lotes-convenio-workspace";

export const metadata: Metadata = {
  title: "Faturamento de convênios",
};

export default function FinanceiroConveniosPage() {
  return <LotesConvenioWorkspace />;
}
