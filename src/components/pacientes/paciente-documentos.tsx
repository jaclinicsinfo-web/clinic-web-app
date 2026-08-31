"use client";

import { DocumentosView } from "@/components/pacientes/documentos-view";
import { usePacientePerfil } from "@/components/pacientes/paciente-perfil-shell";

export function PacienteDocumentos() {
  const { paciente, detalhe } = usePacientePerfil();
  return <DocumentosView documentos={detalhe.documentos} pacienteNome={paciente.nome} />;
}
