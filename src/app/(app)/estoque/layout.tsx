import { GuardaPlanoModulo } from "@/components/modulos/guarda-plano-modulo";

export default function EstoqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardaPlanoModulo
      modulo="estoque"
      titulo="Estoque"
      descricao="Insumos, saldos e movimentações de entrada e saída da clínica."
      itens={[
        "Cadastro de produtos e estoque mínimo",
        "Entradas, saídas e consumo por procedimento",
        "Alertas de saldo baixo",
      ]}
    >
      {children}
    </GuardaPlanoModulo>
  );
}
