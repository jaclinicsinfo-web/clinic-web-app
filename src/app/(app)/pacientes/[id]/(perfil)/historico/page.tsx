import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, CalendarX, Percent, UserX } from "lucide-react";

import { HistoricoTable } from "@/components/pacientes/historico-table";
import { StatCard } from "@/components/shared/stat-card";
import { formatPercent } from "@/lib/format";
import { getAgendamentosDoPaciente, getPacienteById } from "@/services/pacientes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paciente = getPacienteById(id);
  return { title: paciente ? `Histórico de ${paciente.nome}` : "Histórico" };
}

export default async function HistoricoPage({ params }: PageProps) {
  const { id } = await params;
  const paciente = getPacienteById(id);

  if (!paciente) notFound();

  const agendamentos = getAgendamentosDoPaciente(id);
  const realizados = agendamentos.filter((agendamento) => agendamento.status === "atendido").length;
  const cancelados = agendamentos.filter((agendamento) => agendamento.status === "cancelado").length;
  const faltas = agendamentos.filter((agendamento) => agendamento.status === "faltou").length;
  const taxaFaltas = agendamentos.length > 0 ? (faltas / agendamentos.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Atendimentos realizados" value={String(realizados)} icon={CalendarCheck} />
        <StatCard label="Cancelamentos" value={String(cancelados)} icon={CalendarX} />
        <StatCard label="Faltas" value={String(faltas)} icon={UserX} />
        <StatCard
          label="Taxa de faltas"
          value={formatPercent(taxaFaltas)}
          icon={Percent}
          hint="Sobre o total de agendamentos"
        />
      </div>

      <HistoricoTable agendamentos={agendamentos} />
    </div>
  );
}
