import type { Metadata } from "next";

import { ModuloReservado } from "@/components/modulos/modulo-reservado";

export const metadata: Metadata = {
  title: "Agente de IA",
};

export default function AgenteIaPage() {
  return (
    <ModuloReservado
      titulo="Agente de IA"
      descricao="Assistente da clínica para rotinas, dúvidas operacionais e apoio à recepção."
      modulo="agenteia"
      itens={[
        "Respostas sobre agenda, pacientes e procedimentos",
        "Sugestões de encaixe e confirmação de consultas",
        "Apoio à equipe sem substituir o prontuário clínico",
      ]}
    />
  );
}
