import type { Metadata } from "next";

import { ModelosMensagemView } from "@/components/configuracoes/modelos-mensagem-view";
import { modelosMensagem } from "@/services/configuracoes";

export const metadata: Metadata = {
  title: "Modelos de mensagens",
};

export default function MensagensPage() {
  return <ModelosMensagemView modelos={modelosMensagem} />;
}
