import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProntuarioView } from "@/components/pacientes/prontuario-view";
import { listProcedimentos } from "@/services/catalogo";
import { getAtendimentosDoPaciente, getAcompanhamentosDoPaciente, getPacienteById } from "@/services/pacientes";
import { listProfissionais } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paciente = getPacienteById(id);
  return { title: paciente ? `Acompanhamento de ${paciente.nome}` : "Acompanhamento" };
}

export default async function ProntuarioPage({ params }: PageProps) {
  const { id } = await params;
  const paciente = getPacienteById(id);

  if (!paciente) notFound();

  const procedimentos = listProcedimentos()
    .filter((procedimento) => procedimento.status === "ativo")
    .map(({ id: procedimentoId, nome }) => ({ id: procedimentoId, nome }));

  const profissionais = listProfissionais()
    .filter((profissional) => profissional.status === "ativo")
    .map(({ id: profissionalId, nome }) => ({ id: profissionalId, nome }));

  return (
    <ProntuarioView
      acompanhamentos={getAcompanhamentosDoPaciente(id)}
      atendimentos={getAtendimentosDoPaciente(id)}
      procedimentos={procedimentos}
      profissionais={profissionais}
      pacienteNome={paciente.nome}
    />
  );
}
