import type { Metadata } from "next";

import { EstilizacaoWorkspace } from "@/components/configuracoes/estilizacao-workspace";

export const metadata: Metadata = {
  title: "Estilização",
};

export default function EstilizacaoPage() {
  return <EstilizacaoWorkspace />;
}
