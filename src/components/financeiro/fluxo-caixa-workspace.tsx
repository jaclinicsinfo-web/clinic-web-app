"use client";

import * as React from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { FluxoCaixaChart } from "@/components/financeiro/fluxo-caixa-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { obterFluxoCaixaApi, type ResumoFluxoCaixa } from "@/services/financeiro";
import type { FluxoCaixaPonto } from "@/types";

const resumoVazio: ResumoFluxoCaixa = {
  entradasMes: 0,
  saidasMes: 0,
  saldoMes: 0,
  variacaoEntradas: 0,
  variacaoSaidas: 0,
  variacaoSaldo: 0,
};

export function FluxoCaixaWorkspace() {
  const [resumo, setResumo] = React.useState(resumoVazio);
  const [diario, setDiario] = React.useState<FluxoCaixaPonto[]>([]);
  const [mensal, setMensal] = React.useState<FluxoCaixaPonto[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await obterFluxoCaixaApi();
        if (!ativo) return;
        setResumo(data.resumo);
        setDiario(data.diario);
        setMensal(data.mensal);
      } catch (error) {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o fluxo de caixa.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  const valor = (numero: number) => (carregando ? "—" : formatCurrency(numero));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fluxo de caixa"
        description="Entradas, saídas e saldo da operação nos últimos 30 dias e 12 meses."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Entradas do mês"
          value={valor(resumo.entradasMes)}
          icon={TrendingUp}
          variation={carregando ? undefined : resumo.variacaoEntradas}
        />
        <StatCard
          label="Saídas do mês"
          value={valor(resumo.saidasMes)}
          icon={TrendingDown}
          variation={carregando ? undefined : resumo.variacaoSaidas}
          invertVariation
        />
        <StatCard
          label="Saldo do mês"
          value={valor(resumo.saldoMes)}
          icon={Wallet}
          variation={carregando ? undefined : resumo.variacaoSaldo}
        />
      </div>

      <FluxoCaixaChart diario={diario} mensal={mensal} height={360} />
    </div>
  );
}
