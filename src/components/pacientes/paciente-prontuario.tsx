"use client";

import { usePacientePerfil } from "@/components/pacientes/paciente-perfil-shell";
import { ProntuarioView } from "@/components/pacientes/prontuario-view";

export function PacienteProntuario() {
  const { paciente, detalhe } = usePacientePerfil();

  return (
    <ProntuarioView
      acompanhamentos={detalhe.acompanhamentos}
      atendimentos={detalhe.atendimentos}
      procedimentos={[]}
      profissionais={
        paciente.profissionalPreferidoId && paciente.profissionalPreferidoNome
          ? [{ id: paciente.profissionalPreferidoId, nome: paciente.profissionalPreferidoNome }]
          : []
      }
      pacienteNome={paciente.nome}
    />
  );
}
