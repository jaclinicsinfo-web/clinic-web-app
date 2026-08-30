import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, CircleDollarSign, Receipt, Wallet } from "lucide-react";

import { FinanceiroPacienteTable } from "@/components/pacientes/financeiro-paciente";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { getCobrancasDoPaciente, getPacienteById } from "@/services/pacientes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paciente = getPacienteById(id);
  return { title: paciente ? `Financeiro de ${paciente.nome}` : "Financeiro" };
}

export default async function FinanceiroPacientePage({ params }: PageProps) {
  const { id } = await params;
  const paciente = getPacienteById(id);

  if (!paciente) notFound();

  const cobrancas = getCobrancasDoPaciente(id);
  const pagas = cobrancas.filter((cobranca) => cobranca.status === "pago");
  const atrasadas = cobrancas.filter((cobranca) => cobranca.status === "atrasado");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo devedor" value={formatCurrency(paciente.saldoDevedor)} icon={Wallet} />
        <StatCard
          label="Recebido"
          value={formatCurrency(pagas.reduce((total, cobranca) => total + cobranca.valor, 0))}
          icon={CircleDollarSign}
          hint={`${pagas.length} cobranças quitadas`}
        />
        <StatCard label="Cobranças em aberto" value={String(cobrancas.length - pagas.length)} icon={Receipt} />
        <StatCard
          label="Em atraso"
          value={formatCurrency(atrasadas.reduce((total, cobranca) => total + cobranca.valor, 0))}
          icon={AlertCircle}
          hint={`${atrasadas.length} ${atrasadas.length === 1 ? "lançamento" : "lançamentos"}`}
        />
      </div>

      <FinanceiroPacienteTable cobrancas={cobrancas} />
    </div>
  );
}
