import type { Metadata } from "next";

import { ProcedimentosWorkspace } from "@/components/configuracoes/procedimentos-workspace";

export const metadata: Metadata = {
  title: "Procedimentos",
};

export default function ProcedimentosPage() {
  return <ProcedimentosWorkspace />;
}
