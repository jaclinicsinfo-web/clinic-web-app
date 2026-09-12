import { GuardaPlanoModulo } from "@/components/modulos/guarda-plano-modulo";

export default function IntegracoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardaPlanoModulo
      modulo="integracoes"
      titulo="Integrações e lembretes"
      descricao="WhatsApp oficial da Meta e e-mail para confirmações e lembretes automáticos da agenda."
      itens={[
        "Lembretes de consulta por WhatsApp (Cloud API da Meta)",
        "Confirmação, reagendamento e cancelamento por e-mail",
        "Custos de disparo registrados para repasse à clínica",
      ]}
    >
      {children}
    </GuardaPlanoModulo>
  );
}
