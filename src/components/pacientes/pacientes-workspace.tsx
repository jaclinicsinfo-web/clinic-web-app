"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Plus, UserCheck, Users } from "lucide-react";

import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { Pode } from "@/components/auth/pode";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useEntidadeLabelsStore } from "@/hooks/use-entidade-labels";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { isProfissionalSaude } from "@/lib/plano";
import { useSessaoStore } from "@/hooks/use-sessao";
import {
  arquivarPacienteApi,
  listarPacientesApi,
  type OpcaoPaciente,
  type ResumoPacientes,
} from "@/services/pacientes";
import type { Paciente } from "@/types";

const resumoVazio: ResumoPacientes = {
  total: 0,
  ativos: 0,
  inativos: 0,
  arquivados: 0,
  comPendencia: 0,
  valorEmAberto: 0,
};

export function PacientesWorkspace() {
  const perfil = useSessaoStore((state) => state.sessao?.perfil);
  const setPacienteNome = useEntidadeLabelsStore((state) => state.setPaciente);
  const profissionalSaude = isProfissionalSaude(perfil);

  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [resumo, setResumo] = React.useState<ResumoPacientes>(resumoVazio);
  const [convenios, setConvenios] = React.useState<OpcaoPaciente[]>([]);
  const [profissionais, setProfissionais] = React.useState<OpcaoPaciente[]>([]);
  const [somenteProprios, setSomenteProprios] = React.useState(profissionalSaude);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarPacientesApi();
      setPacientes(data.pacientes);
      setResumo(data.resumo);
      setConvenios(data.convenios);
      setProfissionais(data.profissionais);
      setSomenteProprios(data.somenteProprios);
      data.pacientes.forEach((paciente) => setPacienteNome(paciente.id, paciente.nome));
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar os pacientes. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }, [setPacienteNome]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function arquivar(paciente: Paciente) {
    const atualizado = await arquivarPacienteApi(paciente.id);
    setPacientes((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
    setResumo((atual) => {
      const anterior = pacientes.find((item) => item.id === paciente.id);
      if (!anterior || anterior.status === "arquivado") return atual;
      return {
        ...atual,
        ativos: anterior.status === "ativo" ? Math.max(0, atual.ativos - 1) : atual.ativos,
        inativos: anterior.status === "inativo" ? Math.max(0, atual.inativos - 1) : atual.inativos,
        arquivados: atual.arquivados + 1,
      };
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description={
          somenteProprios
            ? "Cadastro e acompanhamento dos pacientes vinculados a você."
            : "Cadastro, acompanhamento e situação financeira dos pacientes da clínica."
        }
        actions={
          <Pode modulo="pacientes" acao="criar">
            <Button asChild>
              <Link href="/pacientes/novo">
                <Plus />
                Novo paciente
              </Link>
            </Button>
          </Pode>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de pacientes" value={String(resumo.total)} icon={Users} />
        <StatCard
          label="Pacientes ativos"
          value={String(resumo.ativos)}
          icon={UserCheck}
          hint={`${resumo.inativos} inativos · ${resumo.arquivados} arquivados`}
        />
        <StatCard
          label="Com pendência financeira"
          value={String(resumo.comPendencia)}
          icon={AlertCircle}
          hint="Cobranças pendentes ou em atraso"
        />
        <StatCard label="Valor em aberto" value={formatCurrency(resumo.valorEmAberto)} icon={AlertCircle} />
      </div>

      {erro ? (
        <EmptyState
          title="Não foi possível listar os pacientes"
          description={erro}
          action={
            <Button variant="outline" onClick={() => void carregar()}>
              Tentar de novo
            </Button>
          }
        />
      ) : (
        <PacientesTable
          pacientes={pacientes}
          convenios={convenios}
          profissionais={profissionais}
          carregando={carregando}
          somenteProprios={somenteProprios}
          onArquivar={arquivar}
        />
      )}
    </div>
  );
}
