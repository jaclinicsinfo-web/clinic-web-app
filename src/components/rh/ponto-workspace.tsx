"use client";

import * as React from "react";
import { Clock, Timer, UserCheck, UserX } from "lucide-react";

import { BaterPontoButton } from "@/components/rh/bater-ponto-button";
import { PontoTable } from "@/components/rh/ponto-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { formatMinutes } from "@/lib/format";
import { temPermissao } from "@/lib/permissoes";
import { isAdminOuGestor } from "@/lib/plano";
import { listarPontoApi, type ListaPonto } from "@/services/rh";
import type { RegistroPonto } from "@/types";

export function PontoWorkspace() {
  const sessao = useSessaoStore((state) => state.sessao);
  const permissoes = sessao?.permissoes;
  const podeCriar = temPermissao(permissoes, "rh", "criar");
  const podeEditarPermissao = temPermissao(permissoes, "rh", "editar");
  const podeExcluirPermissao = temPermissao(permissoes, "rh", "excluir");

  const [dados, setDados] = React.useState<ListaPonto | null>(null);
  const [inicio, setInicio] = React.useState("");
  const [fim, setFim] = React.useState("");
  const [usuarioId, setUsuarioId] = React.useState("todos");
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async (de?: string, ate?: string, usuario?: string) => {
    setErro(null);
    try {
      const payload = await listarPontoApi({
        inicio: de || undefined,
        fim: ate || undefined,
        usuarioId: !usuario || usuario === "todos" ? undefined : usuario,
      });
      setDados(payload);
      setInicio(payload.inicio);
      setFim(payload.fim);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o ponto.");
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  function aplicarRegistro(registro: RegistroPonto) {
    setDados((atual) => {
      if (!atual) return atual;
      const existe = atual.registros.some((item) => item.id === registro.id);
      const registros = existe
        ? atual.registros.map((item) => (item.id === registro.id ? registro : item))
        : [registro, ...atual.registros];
      return recalcular(atual, registros);
    });
  }

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  if (!dados) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const registroHoje = dados.registros.find(
    (item) => item.usuarioId === sessao?.id && item.data === dados.hoje,
  );
  const somenteProprios = dados.somenteProprios ?? !isAdminOuGestor(sessao?.perfil);
  const podeEditar = podeEditarPermissao && !somenteProprios;
  const podeExcluir = podeExcluirPermissao && !somenteProprios;
  const podeLancar = podeCriar && !somenteProprios;

  return (
    <div className="space-y-6">
      <PageHeader
        title={somenteProprios ? "Meu ponto" : "Controle de ponto"}
        description={
          somenteProprios
            ? "Registre sua entrada, intervalo e saída. Você vê apenas os seus horários."
            : "Batidas de entrada, intervalo e saída dos usuários da clínica."
        }
        actions={podeCriar ? <BaterPontoButton registroHoje={registroHoje} onRegistrado={aplicarRegistro} /> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={somenteProprios ? "Ponto de hoje" : "Presentes hoje"}
          value={somenteProprios ? (dados.resumo.presentesHoje ? "Registrado" : "Pendente") : String(dados.resumo.presentesHoje)}
          icon={UserCheck}
          hint={somenteProprios ? "Situação da sua primeira batida" : `${dados.resumo.ausentesHoje} ainda sem entrada`}
        />
        <StatCard
          label={somenteProprios ? "Status" : "Ausentes hoje"}
          value={
            somenteProprios
              ? dados.resumo.emAndamento
                ? "Em andamento"
                : dados.resumo.completos
                  ? "Completo"
                  : "Sem batida"
              : String(dados.resumo.ausentesHoje)
          }
          icon={UserX}
          hint={somenteProprios ? "Do seu registro no período" : "Usuários ativos sem batida no dia"}
        />
        <StatCard
          label="Registros no período"
          value={String(dados.resumo.registros)}
          icon={Clock}
          hint={`${dados.resumo.completos} completos · ${dados.resumo.emAndamento} em andamento`}
        />
        <StatCard
          label="Horas trabalhadas"
          value={formatMinutes(dados.resumo.minutosTrabalhados)}
          icon={Timer}
          hint="Soma dos dias com entrada e saída"
        />
      </div>

      <PontoTable
        registros={dados.registros}
        usuarios={dados.usuarios}
        inicio={inicio}
        fim={fim}
        dataPadrao={dados.hoje}
        usuarioFiltro={usuarioId}
        somenteProprios={somenteProprios}
        podeCriar={podeLancar}
        podeEditar={podeEditar}
        podeExcluir={podeExcluir}
        onPeriodo={(de, ate) => {
          setInicio(de);
          setFim(ate);
          void carregar(de, ate, usuarioId);
        }}
        onUsuario={(id) => {
          setUsuarioId(id);
          void carregar(inicio, fim, id);
        }}
        onSalvo={aplicarRegistro}
        onExcluido={(id) =>
          setDados((atual) => (atual ? recalcular(atual, atual.registros.filter((item) => item.id !== id)) : atual))
        }
      />
    </div>
  );
}

function recalcular(atual: ListaPonto, registros: RegistroPonto[]): ListaPonto {
  const doDia = registros.filter((item) => item.data === atual.hoje);
  const presentes = new Set(doDia.filter((item) => item.entrada).map((item) => item.usuarioId));
  const ativos = atual.usuarios.filter((item) => item.status === "ativo").length;

  return {
    ...atual,
    registros,
    resumo: {
      registros: registros.length,
      completos: registros.filter((item) => item.status === "completo").length,
      emAndamento: registros.filter((item) => item.status === "em_andamento").length,
      presentesHoje: presentes.size,
      ausentesHoje: Math.max(ativos - presentes.size, 0),
      minutosTrabalhados: registros.reduce((total, item) => total + (item.minutosTrabalhados ?? 0), 0),
    },
  };
}
