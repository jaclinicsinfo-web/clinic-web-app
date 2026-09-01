import type { Metadata } from "next";

import { ModuloReservado } from "@/components/modulos/modulo-reservado";

export const metadata: Metadata = {
  title: "Power BI",
};

export default function PowerBiPage() {
  return (
    <ModuloReservado
      titulo="Power BI"
      descricao="Painéis gerenciais com os dados da clínica no Power BI."
      modulo="powerbi"
      itens={[
        "Conexão com o workspace da clínica",
        "Indicadores de agenda, faturamento e produtividade",
        "Atualização automática dos conjuntos de dados",
      ]}
    />
  );
}
