import type { Metadata } from "next";
import { AlertCircle, CalendarClock, CircleDollarSign, Wallet } from "lucide-react";

import { ContasAReceberTable } from "@/components/financeiro/contas-a-receber-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { listConvenios } from "@/services/catalogo";
import { getResumoContasAReceber, listCobrancas } from "@/services/financeiro";

export const metadata: Metadata = {
  title: "Contas a receber",
};

export default function ContasAReceberPage() {
  const resumo = getResumoContasAReceber();
  const convenios = listConvenios().map(({ id, nome }) => ({ id, nome }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas a receber"
        description="Cobranças de pacientes e faturamento particular da clínica."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Em aberto" value={formatCurrency(resumo.totalEmAberto)} icon={Wallet} />
        <StatCard
          label="Em atraso"
          value={formatCurrency(resumo.totalAtrasado)}
          icon={AlertCircle}
          hint={`${resumo.quantidadeAtrasada} cobranças`}
        />
        <StatCard label="Recebido no mês" value={formatCurrency(resumo.recebidoNoMes)} icon={CircleDollarSign} />
        <StatCard
          label="Vence em 7 dias"
          value={formatCurrency(resumo.vencendo7Dias)}
          icon={CalendarClock}
          hint={`${resumo.quantidadeVencendo7Dias} cobranças`}
        />
      </div>

      <ContasAReceberTable cobrancas={listCobrancas()} convenios={convenios} />
    </div>
  );
}
