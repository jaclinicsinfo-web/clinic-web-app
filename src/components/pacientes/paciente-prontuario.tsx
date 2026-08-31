"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { usePacientePerfil } from "@/components/pacientes/paciente-perfil-shell";
import { ProntuarioView } from "@/components/pacientes/prontuario-view";
import { EmptyState } from "@/components/shared/empty-state";
import { ApiError } from "@/lib/api";
import { opcoesClinicasPacienteApi, type OpcaoPaciente } from "@/services/pacientes";

export function PacienteProntuario() {
  const { paciente, detalhe, atualizarDetalhe } = usePacientePerfil();
  const [procedimentos, setProcedimentos] = React.useState<OpcaoPaciente[]>([]);
  const [profissionais, setProfissionais] = React.useState<OpcaoPaciente[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const opcoes = await opcoesClinicasPacienteApi(paciente.id);
        if (!ativo) return;
        setProcedimentos(opcoes.procedimentos);
        setProfissionais(opcoes.profissionais);
      } catch (error) {
        if (!ativo) return;
        setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as opções clínicas.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => {
      ativo = false;
    };
  }, [paciente.id]);

  if (!detalhe.podeVerProntuario) {
    return (
      <EmptyState
        title="Prontuário restrito"
        description="Seu perfil não tem permissão para visualizar o prontuário deste paciente."
      />
    );
  }

  if (carregando) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando prontuário" />
      </div>
    );
  }

  if (erro) {
    return <EmptyState title="Não foi possível abrir o prontuário" description={erro} />;
  }

  return (
    <ProntuarioView
      pacienteId={paciente.id}
      acompanhamentos={detalhe.acompanhamentos}
      atendimentos={detalhe.atendimentos}
      procedimentos={procedimentos}
      profissionais={profissionais}
      pacienteNome={paciente.nome}
      podeRegistrar={Boolean(detalhe.podeRegistrarProntuario)}
      onAtualizado={(dados) => atualizarDetalhe(dados)}
    />
  );
}
