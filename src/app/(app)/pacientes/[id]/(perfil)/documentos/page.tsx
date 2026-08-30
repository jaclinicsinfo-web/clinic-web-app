import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentosView } from "@/components/pacientes/documentos-view";
import { getDocumentosDoPaciente, getPacienteById } from "@/services/pacientes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paciente = getPacienteById(id);
  return { title: paciente ? `Documentos de ${paciente.nome}` : "Documentos" };
}

export default async function DocumentosPage({ params }: PageProps) {
  const { id } = await params;
  const paciente = getPacienteById(id);

  if (!paciente) notFound();

  return <DocumentosView documentos={getDocumentosDoPaciente(id)} pacienteNome={paciente.nome} />;
}
