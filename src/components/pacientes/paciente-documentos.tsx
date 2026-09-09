"use client";

import { DocumentosView } from "@/components/pacientes/documentos-view";
import { usePacientePerfil } from "@/components/pacientes/paciente-perfil-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";

export function PacienteDocumentos() {
  const { paciente, detalhe, atualizarDetalhe } = usePacientePerfil();
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);

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
      podeExcluir={temPermissao(permissoes, "pacientes", "excluir")}
      onAtualizado={(documentos) => atualizarDetalhe({ documentos })}
    />
  );
}
