import type { Metadata } from "next";
import { AlertCircle, CalendarClock, CircleDollarSign, Landmark } from "lucide-react";

import { ContasAPagarTable } from "@/components/financeiro/contas-a-pagar-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { getResumoContasAPagar, listDespesas } from "@/services/financeiro";

export const metadata: Metadata = {
  title: "Contas a pagar",
};

export default function ContasAPagarPage() {
  const despesas = listDespesas();
  const resumo = getResumoContasAPagar();
  const categorias = [...new Set(despesas.map((despesa) => despesa.categoria))].sort();

  return (
    <div className="space-y-6">
      <PageHeader title="Contas a pagar" description="Despesas operacionais, fornecedores e recorrências." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="A pagar" value={formatCurrency(resumo.totalAPagar)} icon={Landmark} />
        <StatCard
          label="Vencidas"
          value={formatCurrency(resumo.totalVencido)}
          icon={AlertCircle}
          hint={`${resumo.quantidadeVencida} despesas`}
        />
        <StatCard label="Pago no mês" value={formatCurrency(resumo.pagoNoMes)} icon={CircleDollarSign} />
        <StatCard
          label="Vence em 7 dias"
          value={formatCurrency(resumo.vencendo7Dias)}
          icon={CalendarClock}
          hint={`${resumo.quantidadeVencendo7Dias} despesas`}
        />
      </div>

      <ContasAPagarTable despesas={despesas} categorias={categorias} />
    </div>
  );
}
