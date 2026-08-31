import type { Metadata } from "next";

import { PacienteFormWorkspace } from "@/components/pacientes/paciente-form-workspace";

export const metadata: Metadata = {
  title: "Editar paciente",
};

export default async function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PacienteFormWorkspace pacienteId={id} />;
}
