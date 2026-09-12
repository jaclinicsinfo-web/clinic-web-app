import { GuardaPlanoModulo } from "@/components/modulos/guarda-plano-modulo";

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardaPlanoModulo
      modulo="financeiro"
      titulo="Financeiro"
      descricao="Visão consolidada de recebimentos, despesas, convênios e comissões da clínica."
      itens={[
        "Contas a receber, a pagar e fluxo de caixa",
        "Faturamento de convênios",
        "Comissões dos profissionais",
      ]}
    >
      {children}
    </GuardaPlanoModulo>
  );
}
