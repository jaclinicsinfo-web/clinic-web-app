"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { EntityTabsNav } from "@/components/pacientes/paciente-tabs-nav";
import { PacienteHeader } from "@/components/pacientes/paciente-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useEntidadeLabelsStore } from "@/hooks/use-entidade-labels";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import { obterPacienteApi, type DetalhePacienteResponse } from "@/services/pacientes";
import type { Paciente } from "@/types";

const PacientePerfilContext = React.createContext<{
  paciente: Paciente;
  detalhe: DetalhePacienteResponse;
  atualizarDetalhe: (parcial: Partial<DetalhePacienteResponse>) => void;
  recarregar: () => Promise<void>;
} | null>(null);

export function usePacientePerfil() {
  const contexto = React.useContext(PacientePerfilContext);
  if (!contexto) {
    throw new Error("usePacientePerfil deve ser usado dentro de PacientePerfilShell.");
  }
  return contexto;
}

export function PacientePerfilShell({
  pacienteId,
  children,
}: {
  pacienteId: string;
  children: React.ReactNode;
}) {
  const setPacienteNome = useEntidadeLabelsStore((state) => state.setPaciente);
  const plano = useSessaoStore((state) => state.sessao?.plano);
  const [detalhe, setDetalhe] = React.useState<DetalhePacienteResponse | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const recarregar = React.useCallback(async () => {
    const data = await obterPacienteApi(pacienteId);
    setDetalhe(data);
    setPacienteNome(data.paciente.id, data.paciente.nome);
  }, [pacienteId, setPacienteNome]);

  React.useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await obterPacienteApi(pacienteId);
        if (!ativo) return;
        setDetalhe(data);
        setPacienteNome(data.paciente.id, data.paciente.nome);
      } catch (error) {
        if (!ativo) return;
        setDetalhe(null);
        setErro(
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar o paciente. Tente novamente.",
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [pacienteId, setPacienteNome]);

  if (carregando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando paciente" />
      </div>
    );
  }

  if (erro || !detalhe) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        description={erro ?? "O registro pode ter sido removido ou você não tem acesso."}
        action={
          <Button variant="outline" asChild>
            <Link href="/pacientes">Voltar para pacientes</Link>
          </Button>
        }
      />
    );
  }

  const tabs = [
    { label: "Visão geral", href: `/pacientes/${pacienteId}` },
    ...(detalhe.podeVerProntuario
      ? [{ label: "Acompanhamento", href: `/pacientes/${pacienteId}/prontuario` }]
      : []),
    { label: "Histórico", href: `/pacientes/${pacienteId}/historico` },
    ...(detalhe.podeVerProntuario
      ? [{ label: "Documentos", href: `/pacientes/${pacienteId}/documentos` }]
      : []),
    ...(planoIncluiModulo(plano, "financeiro")
      ? [{ label: "Financeiro", href: `/pacientes/${pacienteId}/financeiro` }]
      : []),
  ];

  return (
    <PacientePerfilContext.Provider
      value={{
        paciente: detalhe.paciente,
        detalhe,
        atualizarDetalhe: (parcial) =>
          setDetalhe((atual) => (atual ? { ...atual, ...parcial } : atual)),
        recarregar,
      }}
    >
      <div className="space-y-5">
        <PacienteHeader paciente={detalhe.paciente} />
        <EntityTabsNav items={tabs} />
        <div>{children}</div>
      </div>
    </PacientePerfilContext.Provider>
  );
}
