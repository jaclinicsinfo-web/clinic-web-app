import { GuardaPlanoModulo } from "@/components/modulos/guarda-plano-modulo";

export default function RelatoriosLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardaPlanoModulo
      modulo="relatorios"
      titulo="Relatórios"
      descricao="Visão gerencial de faturamento, atendimentos, inadimplência e produtividade."
      itens={[
        "Faturamento, atendimentos e inadimplência",
        "Pacientes novos x recorrentes",
        "Produtividade e comissões",
      ]}
    >
      {children}
    </GuardaPlanoModulo>
  );
}
