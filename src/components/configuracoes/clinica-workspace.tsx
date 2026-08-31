"use client";

import * as React from "react";

import { ClinicaForm } from "@/components/configuracoes/clinica-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { temPermissao } from "@/lib/permissoes";
import { obterClinicaApi, type UnidadeMutacao } from "@/services/configuracoes";
import type { Clinica, Unidade } from "@/types";

export function ClinicaWorkspace() {
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const atualizarClinicaNome = useSessaoStore((state) => state.atualizarClinicaNome);
  const atualizarUnidadesSessao = useSessaoStore((state) => state.atualizarUnidadesSessao);
  const setUnidade = useSessaoStore((state) => state.setUnidade);
  const unidadeAtualId = useSessaoStore((state) => state.sessao?.unidadeAtualId);

  const [clinica, setClinica] = React.useState<Clinica | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  const podeEditar = temPermissao(permissoes, "configuracoes", "editar");
  const podeCriar = temPermissao(permissoes, "configuracoes", "criar");

  React.useEffect(() => {
    let ativo = true;
    obterClinicaApi()
      .then((data) => {
        if (ativo) setClinica(data);
      })
      .catch((error) => {
        if (ativo) {
          setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os dados da clínica.");
        }
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function sincronizarUnidades(resultado: UnidadeMutacao, unidades: Unidade[]) {
    setClinica((atual) => (atual ? { ...atual, unidades } : atual));
    atualizarUnidadesSessao(resultado.unidadesSessao);
    if (
      unidadeAtualId &&
      !resultado.unidadesSessao.some((item) => item.id === unidadeAtualId) &&
      resultado.unidadesSessao[0]
    ) {
      await setUnidade(resultado.unidadesSessao[0].id);
    }
  }

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  if (!clinica) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <ClinicaForm
      clinica={clinica}
      podeEditar={podeEditar}
      podeCriar={podeCriar}
      onAtualizada={(atualizada) => {
        setClinica(atualizada);
        atualizarClinicaNome(atualizada.nomeFantasia);
      }}
      onUnidades={sincronizarUnidades}
    />
  );
}
