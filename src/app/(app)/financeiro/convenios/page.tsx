import type { Metadata } from "next";
import { FileWarning, Inbox, Landmark, Percent } from "lucide-react";

import { LotesConvenioTable } from "@/components/financeiro/lotes-convenio-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { listConvenios } from "@/services/catalogo";
import { getResumoConvenios, listLotesConvenio } from "@/services/financeiro";

export const metadata: Metadata = {
  title: "Faturamento de convênios",
};

export default function FinanceiroConveniosPage() {
  const resumo = getResumoConvenios();
  const convenios = listConvenios().map(({ id, nome }) => ({ id, nome }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faturamento de convênios"
        description="Lotes enviados, glosas e valores recebidos das operadoras."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Apresentado" value={formatCurrency(resumo.valorApresentado)} icon={Inbox} />
        <StatCard
          label="Glosado"
          value={formatCurrency(resumo.valorGlosado)}
          icon={FileWarning}
          hint={formatPercent(resumo.taxaGlosa)}
        />
        <StatCard label="Recebido" value={formatCurrency(resumo.valorRecebido)} icon={Landmark} />
        <StatCard
          label="Taxa de glosa"
          value={formatPercent(resumo.taxaGlosa)}
          icon={Percent}
          hint={`${resumo.lotesAbertos} abertos · ${resumo.lotesAguardando} enviados`}
        />
      </div>

      <LotesConvenioTable lotes={listLotesConvenio()} convenios={convenios} />
    </div>
  );
}
