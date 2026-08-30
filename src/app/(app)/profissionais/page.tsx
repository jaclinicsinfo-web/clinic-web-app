import type { Metadata } from "next";
import Link from "next/link";
import { Percent, Plus, Stethoscope, UserCheck, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ProfissionaisTable } from "@/components/profissionais/profissionais-table";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/format";
import { especialidades } from "@/services/catalogo";
import { getResumoProfissionais, listProfissionais } from "@/services/profissionais";

export const metadata: Metadata = {
  title: "Profissionais",
};

export default function ProfissionaisPage() {
  const profissionais = listProfissionais();
  const resumo = getResumoProfissionais();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profissionais"
        description="Corpo clínico da clínica: vínculos, comissionamento e disponibilidade na agenda."
        actions={
          <Button asChild>
            <Link href="/profissionais/novo">
              <Plus />
              Novo profissional
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de profissionais" value={String(resumo.total)} icon={Users} />
        <StatCard
          label="Profissionais ativos"
          value={String(resumo.ativos)}
          icon={UserCheck}
          hint={`${resumo.total - resumo.ativos} inativos`}
        />
        <StatCard
          label="Especialidades atendidas"
          value={String(resumo.especialidades)}
          icon={Stethoscope}
          hint="Especialidades distintas no corpo clínico"
        />
        <StatCard
          label="Comissão média"
          value={formatPercent(resumo.comissaoMedia)}
          icon={Percent}
          hint="Entre profissionais comissionados"
        />
      </div>

      <ProfissionaisTable profissionais={profissionais} especialidades={[...especialidades]} />
    </div>
  );
}
