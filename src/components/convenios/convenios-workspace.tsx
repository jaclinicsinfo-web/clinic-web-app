"use client";

import * as React from "react";
import { Handshake, Plus, ShieldCheck, Timer, Users } from "lucide-react";

import { ConvenioDialog } from "@/components/convenios/convenio-dialog";
import { ConveniosTable } from "@/components/convenios/convenios-table";
import { Pode } from "@/components/auth/pode";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  ativarConvenioApi,
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
  const [novoAberto, setNovoAberto] = React.useState(false);

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

  function substituir(atualizado: Convenio, anteriorStatus?: Convenio["status"]) {
    setConvenios((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
    if (anteriorStatus && anteriorStatus !== atualizado.status) {
      setResumo((atual) => ({
        ...atual,
        ativos: Math.max(0, atual.ativos + (atualizado.status === "ativo" ? 1 : -1)),
      }));
    }
  }

  async function inativar(convenio: Convenio) {
    const atualizado = await inativarConvenioApi(convenio.id);
    substituir(atualizado, convenio.status);
  }

  async function ativar(convenio: Convenio) {
    const atualizado = await ativarConvenioApi(convenio.id);
    substituir(atualizado, convenio.status);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convênios"
        description="Operadoras, tabela de preços por procedimento e regras de autorização prévia."
        actions={
          <Pode modulo="convenios" acao="criar">
            <Button onClick={() => setNovoAberto(true)}>
              <Plus />
              Novo convênio
            </Button>
          </Pode>
        }
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

          <ConveniosTable
            convenios={convenios}
            onInativar={inativar}
            onAtivar={ativar}
            onAtualizado={(atualizado) =>
              substituir(atualizado, convenios.find((item) => item.id === atualizado.id)?.status)
            }
          />
        </>
      )}

      <ConvenioDialog open={novoAberto} onOpenChange={setNovoAberto} onSalvo={() => void carregar()} />
    </div>
  );
}
