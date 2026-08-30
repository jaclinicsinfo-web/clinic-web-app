import type { Metadata } from "next";

import { FormasPagamentoView } from "@/components/configuracoes/formas-pagamento-view";
import { formasPagamentoAceitas } from "@/services/configuracoes";

export const metadata: Metadata = {
  title: "Formas de pagamento",
};

export default function PagamentosPage() {
  return <FormasPagamentoView formas={formasPagamentoAceitas} />;
}
