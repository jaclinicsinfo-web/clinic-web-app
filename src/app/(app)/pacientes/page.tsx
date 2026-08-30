import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Plus, UserCheck, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getResumoPacientes, listPacientes } from "@/services/pacientes";
import { listConvenios } from "@/services/catalogo";
import { listProfissionais } from "@/services/profissionais";

export const metadata: Metadata = {
  title: "Pacientes",
};

export default function PacientesPage() {
  const pacientes = listPacientes();
  const resumo = getResumoPacientes();
  const convenios = listConvenios().map(({ id, nome }) => ({ id, nome }));
  const profissionais = listProfissionais()
    .filter((profissional) => profissional.status === "ativo")
    .map(({ id, nome }) => ({ id, nome }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Cadastro, acompanhamento e situação financeira dos pacientes da clínica."
        actions={
          <Button asChild>
            <Link href="/pacientes/novo">
              <Plus />
              Novo paciente
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de pacientes" value={String(resumo.total)} icon={Users} />
        <StatCard
          label="Pacientes ativos"
          value={String(resumo.ativos)}
          icon={UserCheck}
          hint={`${resumo.inativos} inativos · ${resumo.arquivados} arquivados`}
        />
        <StatCard
          label="Com pendência financeira"
          value={String(resumo.comPendencia)}
          icon={AlertCircle}
          hint="Cobranças pendentes ou em atraso"
        />
        <StatCard label="Valor em aberto" value={formatCurrency(resumo.valorEmAberto)} icon={AlertCircle} />
      </div>

      <PacientesTable pacientes={pacientes} convenios={convenios} profissionais={profissionais} />
    </div>
  );
}
