"use client";

import * as React from "react";
import { Handshake, ShieldCheck, Timer, Users } from "lucide-react";

import { ConveniosTable } from "@/components/convenios/convenios-table";
import { NovoConvenioDialog } from "@/components/convenios/novo-convenio-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ApiError } from "@/lib/api";
import {
  inativarConvenioApi,
  listarConveniosApi,
  type ResumoConvenios,
} from "@/services/convenios";
import type { Convenio } from "@/types";

const resumoVazio: ResumoConvenios = {
  total: 0,
  ativos: 0,
  exigemAutorizacao: 0,
  prazoMedio: 0,
};

export function ConveniosWorkspace() {
  const [convenios, setConvenios] = React.useState<Convenio[]>([]);
  const [resumo, setResumo] = React.useState<ResumoConvenios>(resumoVazio);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarConveniosApi();
      setConvenios(data.convenios);
      setResumo(data.resumo);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os convênios.");
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function inativar(convenio: Convenio) {
    const atualizado = await inativarConvenioApi(convenio.id);
    setConvenios((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
    setResumo((atual) => ({
      ...atual,
      ativos: Math.max(0, atual.ativos - (convenio.status === "ativo" ? 1 : 0)),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convênios"
        description="Operadoras, tabela de preços por procedimento e regras de autorização prévia."
        actions={<NovoConvenioDialog onCriado={() => void carregar()} />}
      />

      {erro ? (
        <EmptyState title="Não foi possível carregar" description={erro} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Convênios cadastrados" value={carregando ? "—" : String(resumo.total)} icon={ShieldCheck} />
            <StatCard label="Ativos" value={carregando ? "—" : String(resumo.ativos)} icon={Handshake} />
            <StatCard
              label="Exigem autorização"
              value={carregando ? "—" : String(resumo.exigemAutorizacao)}
              icon={Users}
              hint="Senha prévia no agendamento"
            />
            <StatCard
              label="Prazo médio de pagamento"
              value={carregando ? "—" : `${resumo.prazoMedio} dias`}
              icon={Timer}
            />
          </div>

          <ConveniosTable convenios={convenios} onInativar={inativar} />
        </>
      )}
    </div>
  );
}
