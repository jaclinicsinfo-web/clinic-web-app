import type { Metadata } from "next";
import { Handshake, ShieldCheck, Timer, Users } from "lucide-react";

import { ConveniosTable } from "@/components/convenios/convenios-table";
import { NovoConvenioDialog } from "@/components/convenios/novo-convenio-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getResumoConveniosCadastro, listConvenios } from "@/services/catalogo";

export const metadata: Metadata = {
  title: "Convênios",
};

export default function ConveniosPage() {
  const convenios = listConvenios();
  const resumo = getResumoConveniosCadastro();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convênios"
        description="Operadoras, tabela de preços por procedimento e regras de autorização prévia."
        actions={<NovoConvenioDialog />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Convênios cadastrados" value={String(resumo.total)} icon={ShieldCheck} />
        <StatCard label="Ativos" value={String(resumo.ativos)} icon={Handshake} />
        <StatCard
          label="Exigem autorização"
          value={String(resumo.exigemAutorizacao)}
          icon={Users}
          hint="Senha prévia no agendamento"
        />
        <StatCard
          label="Prazo médio de pagamento"
          value={`${resumo.prazoMedio} dias`}
          icon={Timer}
        />
      </div>

      <ConveniosTable convenios={convenios} />
    </div>
  );
}
