import type { Metadata } from "next";

import { ModuloReservado } from "@/components/modulos/modulo-reservado";

export const metadata: Metadata = {
  title: "Integrações e lembretes",
};

export default function IntegracoesPage() {
  return (
    <ModuloReservado
      titulo="Integrações e lembretes"
      descricao="WhatsApp, e-mail e calendário para confirmações e lembretes automáticos."
      modulo="integracoes"
      itens={[
        "Envio de lembretes de consulta por WhatsApp",
        "Confirmação e cancelamento por e-mail",
        "Sincronização com calendário externo",
      ]}
    />
  );
}
