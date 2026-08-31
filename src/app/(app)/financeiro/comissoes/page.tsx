import type { Metadata } from "next";

import { ComissoesWorkspace } from "@/components/financeiro/comissoes-workspace";

export const metadata: Metadata = {
  title: "Comissões",
};

export default function ComissoesPage() {
  return <ComissoesWorkspace />;
}
