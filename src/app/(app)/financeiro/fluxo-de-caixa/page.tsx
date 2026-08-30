import type { Metadata } from "next";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { FluxoCaixaChart } from "@/components/financeiro/fluxo-caixa-chart";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { getFluxoCaixaDiario, getFluxoCaixaMensal, getResumoFluxoCaixa } from "@/services/financeiro";

export const metadata: Metadata = {
  title: "Fluxo de caixa",
};

export default function FluxoDeCaixaPage() {
  const resumo = getResumoFluxoCaixa();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fluxo de caixa"
        description="Entradas, saídas e saldo da operação nos últimos 30 dias e 12 meses."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Entradas do mês"
          value={formatCurrency(resumo.entradasMes)}
          icon={TrendingUp}
          variation={resumo.variacaoEntradas}
        />
        <StatCard
          label="Saídas do mês"
          value={formatCurrency(resumo.saidasMes)}
          icon={TrendingDown}
          variation={resumo.variacaoSaidas}
          invertVariation
        />
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(resumo.saldoMes)}
          icon={Wallet}
          variation={resumo.variacaoSaldo}
        />
      </div>

      <FluxoCaixaChart diario={getFluxoCaixaDiario()} mensal={getFluxoCaixaMensal()} height={360} />
    </div>
  );
}
