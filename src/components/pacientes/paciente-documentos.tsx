"use client";

import { DocumentosView } from "@/components/pacientes/documentos-view";
import { usePacientePerfil } from "@/components/pacientes/paciente-perfil-shell";
import { EmptyState } from "@/components/shared/empty-state";

export function PacienteDocumentos() {
  const { paciente, detalhe, atualizarDetalhe } = usePacientePerfil();

  if (!detalhe.podeVerProntuario) {
    return (
      <EmptyState
        title="Documentos restritos"
        description="Seu perfil não tem permissão para acessar os documentos clínicos deste paciente."
      />
    );
  }

  return (
    <DocumentosView
      documentos={detalhe.documentos}
      pacienteId={paciente.id}
      pacienteNome={paciente.nome}
      podeRegistrar={Boolean(detalhe.podeRegistrarProntuario)}
      onAtualizado={(documentos) => atualizarDetalhe({ documentos })}
    />
  );
}
