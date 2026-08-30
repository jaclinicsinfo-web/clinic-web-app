import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { PacienteForm } from "@/components/pacientes/paciente-form";
import { listConvenios } from "@/services/catalogo";
import { getPacienteById } from "@/services/pacientes";
import { listProfissionais } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paciente = getPacienteById(id);
  return { title: paciente ? `Editar ${paciente.nome}` : "Paciente não encontrado" };
}

export default async function EditarPacientePage({ params }: PageProps) {
  const { id } = await params;
  const paciente = getPacienteById(id);

  if (!paciente) notFound();

  const convenios = listConvenios()
    .filter((convenio) => convenio.status === "ativo")
    .map(({ id: convenioId, nome }) => ({ id: convenioId, nome }));

  const profissionais = listProfissionais()
    .filter((profissional) => profissional.status === "ativo")
    .map(({ id: profissionalId, nome }) => ({ id: profissionalId, nome }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Editar paciente" description={paciente.nome} />
      <PacienteForm convenios={convenios} profissionais={profissionais} paciente={paciente} />
    </div>
  );
}
