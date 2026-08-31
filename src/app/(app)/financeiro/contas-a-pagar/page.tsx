import type { Metadata } from "next";

import { ContasAPagarWorkspace } from "@/components/financeiro/contas-a-pagar-workspace";

export const metadata: Metadata = {
  title: "Contas a pagar",
};

export default function ContasAPagarPage() {
  return <ContasAPagarWorkspace />;
}
