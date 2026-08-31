import type { Metadata } from "next";

import { FormasPagamentoView } from "@/components/configuracoes/formas-pagamento-view";

export const metadata: Metadata = {
  title: "Formas de pagamento",
};

export default function PagamentosPage() {
  return <FormasPagamentoView />;
}
