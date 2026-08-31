import type { Metadata } from "next";

import { ContasAReceberWorkspace } from "@/components/financeiro/contas-a-receber-workspace";

export const metadata: Metadata = {
  title: "Contas a receber",
};

export default function ContasAReceberPage() {
  return <ContasAReceberWorkspace />;
}
