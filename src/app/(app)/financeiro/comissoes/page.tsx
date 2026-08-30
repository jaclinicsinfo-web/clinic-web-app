import type { Metadata } from "next";
import { BadgeCheck, CircleDollarSign, Users, Wallet } from "lucide-react";

import { ComissoesTable } from "@/components/financeiro/comissoes-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { getResumoComissoes, listComissoes } from "@/services/financeiro";

export const metadata: Metadata = {
  title: "Comissões",
};

export default function ComissoesPage() {
  const comissoes = listComissoes();
  const resumo = getResumoComissoes();
  const competencias = [...new Set(comissoes.map((comissao) => comissao.competencia))].sort().reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comissões"
        description="Repasses do corpo clínico por competência, com aprovação e pagamento."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Previsto na competência" value={formatCurrency(resumo.totalPrevisto)} icon={Wallet} />
        <StatCard label="Aprovadas" value={formatCurrency(resumo.aprovadas)} icon={BadgeCheck} />
        <StatCard label="Pagas" value={formatCurrency(resumo.pagas)} icon={CircleDollarSign} />
        <StatCard
          label="Profissionais"
          value={String(resumo.profissionaisComissionados)}
          icon={Users}
          hint={`Competência ${resumo.competencia}`}
        />
      </div>

      <ComissoesTable comissoes={comissoes} competencias={competencias} />
    </div>
  );
}
