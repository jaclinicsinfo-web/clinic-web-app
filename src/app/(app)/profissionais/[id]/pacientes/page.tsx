import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfissionalPacientesTable } from "@/components/profissionais/profissional-pacientes-table";
import { getConvenioNome } from "@/services/catalogo";
import { getPacientesDoProfissional, getProfissionalById } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profissional = getProfissionalById(id);
  return { title: profissional ? `Pacientes de ${profissional.nome}` : "Pacientes" };
}

export default async function ProfissionalPacientesPage({ params }: PageProps) {
  const { id } = await params;
  const profissional = getProfissionalById(id);

  if (!profissional) notFound();

  const pacientes = getPacientesDoProfissional(id).map(({ paciente, atendimentos, ultimaVisita }) => ({
    id: paciente.id,
    nome: paciente.nome,
    telefone: paciente.telefone,
    convenio: getConvenioNome(paciente.convenioId),
    status: paciente.status,
    atendimentos,
    ultimaVisita,
  }));

  return <ProfissionalPacientesTable pacientes={pacientes} />;
}
