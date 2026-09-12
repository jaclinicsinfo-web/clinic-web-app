"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Files, UserX, Users } from "lucide-react";

import { HoleritesTable } from "@/components/rh/holerites-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { temPermissao } from "@/lib/permissoes";
import { isAdminOuGestor } from "@/lib/plano";
import { listarHoleritesApi, type ListaHolerites } from "@/services/rh";
import type { Holerite } from "@/types";

function formatCompetencia(competencia: string) {
  return format(parseISO(`${competencia}-01`), "MMMM 'de' yyyy", { locale: ptBR });
}

export function HoleritesWorkspace() {
  const sessao = useSessaoStore((state) => state.sessao);
  const permissoes = sessao?.permissoes;
  const podeCriarPermissao = temPermissao(permissoes, "rh", "criar");
  const podeExcluirPermissao = temPermissao(permissoes, "rh", "excluir");

  const [dados, setDados] = React.useState<ListaHolerites | null>(null);
  const [competencia, setCompetencia] = React.useState("");
  const [usuarioId, setUsuarioId] = React.useState("todos");
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async (comp?: string, usuario?: string) => {
    setErro(null);
    try {
      const payload = await listarHoleritesApi({
        competencia: comp || undefined,
        usuarioId: !usuario || usuario === "todos" ? undefined : usuario,
      });
      setDados(payload);
      setCompetencia(payload.competencia);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os holerites.");
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

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

  const somenteProprios = dados.somenteProprios ?? !isAdminOuGestor(sessao?.perfil);
  const podeCriar = podeCriarPermissao && !somenteProprios;
  const podeExcluir = podeExcluirPermissao && !somenteProprios;

  return (
    <div className="space-y-6">
      <PageHeader
        title={somenteProprios ? "Meus holerites" : "Holerites"}
        description={
          somenteProprios
            ? "Contracheques enviados para você, por competência."
            : "Contracheques enviados por usuário e competência."
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={somenteProprios ? "Neste mês" : "Enviados"}
          value={String(dados.resumo.enviados)}
          icon={Files}
          hint={formatCompetencia(dados.competencia)}
        />
        {somenteProprios ? (
          <StatCard
            label="Situação"
            value={dados.resumo.enviados ? "Disponível" : "Aguardando"}
            icon={UserX}
            hint={dados.resumo.enviados ? "Seu holerite já foi enviado" : "Ainda não há arquivo nesta competência"}
          />
        ) : (
          <StatCard
            label="Sem holerite"
            value={String(dados.resumo.semHolerite)}
            icon={UserX}
            hint="Usuários ativos ainda sem arquivo neste mês"
          />
        )}
        {somenteProprios ? null : (
          <StatCard
            label="Usuários ativos"
            value={String(dados.resumo.usuariosAtivos)}
            icon={Users}
            hint="Base para o controle da competência"
          />
        )}
      </div>

      <HoleritesTable
        holerites={dados.holerites}
        usuarios={dados.usuarios}
        competencias={dados.competencias}
        competencia={competencia || dados.competencia}
        usuarioFiltro={usuarioId}
        somenteProprios={somenteProprios}
        podeCriar={podeCriar}
        podeExcluir={podeExcluir}
        onCompetencia={(valor) => {
          setCompetencia(valor);
          void carregar(valor, usuarioId);
        }}
        onUsuario={(id) => {
          setUsuarioId(id);
          void carregar(competencia || dados.competencia, id);
        }}
        onSalvo={(holerite: Holerite) => {
          if (holerite.competencia !== (competencia || dados.competencia)) {
            void carregar(holerite.competencia, usuarioId);
            return;
          }
          setDados((atual) =>
            atual
              ? {
                  ...atual,
                  holerites: [holerite, ...atual.holerites.filter((item) => item.id !== holerite.id)],
                  resumo: {
                    ...atual.resumo,
                    enviados: atual.resumo.enviados + 1,
                    semHolerite: Math.max(atual.resumo.semHolerite - 1, 0),
                  },
                }
              : atual,
          );
        }}
        onExcluido={(id) =>
          setDados((atual) =>
            atual
              ? {
                  ...atual,
                  holerites: atual.holerites.filter((item) => item.id !== id),
                  resumo: {
                    ...atual.resumo,
                    enviados: Math.max(atual.resumo.enviados - 1, 0),
                    semHolerite: atual.resumo.semHolerite + 1,
                  },
                }
              : atual,
          )
        }
      />
    </div>
  );
}
