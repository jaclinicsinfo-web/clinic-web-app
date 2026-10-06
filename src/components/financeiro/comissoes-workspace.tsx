"use client";

import * as React from "react";
import { BadgeCheck, CircleDollarSign, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { ComissoesTable } from "@/components/financeiro/comissoes-table";
import { FecharFolhaButton } from "@/components/financeiro/fechar-folha-button";
import { hojeISO } from "@/components/financeiro/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Pode } from "@/components/auth/pode";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { useSessaoStore } from "@/hooks/use-sessao";
import { formatCurrency } from "@/lib/format";
import {
  aprovarComissaoApi,
  calcularComissoesApi,
  fecharFolhaApi,
  listarComissoesApi,
  pagarComissaoApi,
  type ResumoComissoes,
} from "@/services/financeiro";
import type { Comissao } from "@/types";

const resumoVazio: ResumoComissoes = {
  competencia: hojeISO().slice(0, 7),
  totalPrevisto: 0,
  aprovadas: 0,
  pagas: 0,
  profissionaisComissionados: 0,
};

export function ComissoesWorkspace() {
  const isolado = useSessaoStore((state) => Boolean(state.sessao?.isolarDados));
  const [comissoes, setComissoes] = React.useState<Comissao[]>([]);
  const [resumo, setResumo] = React.useState(resumoVazio);
  const [competencias, setCompetencias] = React.useState<string[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [calculando, setCalculando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const aplicar = React.useCallback(
    (data: { comissoes: Comissao[]; resumo: ResumoComissoes; competencias: string[] }) => {
      setComissoes(data.comissoes);
      setResumo(data.resumo);
      setCompetencias(data.competencias);
    },
    [],
  );

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      aplicar(await listarComissoesApi());
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as comissões.");
    } finally {
      setCarregando(false);
    }
  }, [aplicar]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function calcular() {
    setCalculando(true);
    try {
      aplicar(await calcularComissoesApi(resumo.competencia || hojeISO().slice(0, 7)));
      toast.success("Comissões calculadas");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível calcular as comissões.");
    } finally {
      setCalculando(false);
    }
  }

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comissões"
        description={isolado ? "Suas comissões por competência." : "Repasses do corpo clínico por competência, com aprovação e pagamento."}
        actions={
          <>
            {isolado ? null : (
            <Pode modulo="financeiro" acao="criar">
              <Button variant="outline" loading={calculando} onClick={() => void calcular()}>
                Calcular competência
              </Button>
            </Pode>
            )}
            {!isolado && resumo.competencia ? (
              <Pode modulo="financeiro" acao="editar">
              <FecharFolhaButton
                competencia={resumo.competencia}
                total={resumo.totalPrevisto}
                profissionais={resumo.profissionaisComissionados}
                onFechar={async () => {
                  try {
                    aplicar(await fecharFolhaApi(resumo.competencia));
                    toast.success("Folha de comissões fechada");
                  } catch (error) {
                    toast.error(error instanceof ApiError ? error.message : "Não foi possível fechar a folha.");
                    throw error;
                  }
                }}
              />
              </Pode>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Previsto na competência"
          value={carregando ? "—" : formatCurrency(resumo.totalPrevisto)}
          icon={Wallet}
        />
        <StatCard label="Aprovadas" value={carregando ? "—" : formatCurrency(resumo.aprovadas)} icon={BadgeCheck} />
        <StatCard label="Pagas" value={carregando ? "—" : formatCurrency(resumo.pagas)} icon={CircleDollarSign} />
        <StatCard
          label="Profissionais"
          value={carregando ? "—" : String(resumo.profissionaisComissionados)}
          icon={Users}
          hint={resumo.competencia ? `Competência ${resumo.competencia}` : undefined}
        />
      </div>

      <ComissoesTable
        gestao={!isolado}
        comissoes={comissoes}
        competencias={competencias}
        onAprovar={async (comissao) => {
          try {
            const atualizada = await aprovarComissaoApi(comissao.id);
            setComissoes((atual) => atual.map((item) => (item.id === atualizada.id ? atualizada : item)));
            toast.success("Comissão aprovada");
            await carregar();
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível aprovar.");
          }
        }}
        onPagar={async (comissao) => {
          try {
            await pagarComissaoApi(comissao.id, {
              formaPagamento: "pix",
              data: hojeISO(),
            });
            toast.success("Pagamento registrado");
            await carregar();
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível registrar o pagamento.");
          }
        }}
      />
    </div>
  );
}
