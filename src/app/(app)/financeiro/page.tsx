import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  HandCoins,
  LineChart,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { DreSimplificado } from "@/components/financeiro/dre-simplificado";
import { FluxoCaixaChart } from "@/components/financeiro/fluxo-caixa-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  getDreSimplificado,
  getFluxoCaixaDiario,
  getFluxoCaixaMensal,
  getPacientesInadimplentes,
  getResumoComissoes,
  getResumoContasAPagar,
  getResumoContasAReceber,
  getResumoConvenios,
  getResumoFluxoCaixa,
} from "@/services/financeiro";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function FinanceiroPage() {
  const receber = getResumoContasAReceber();
  const pagar = getResumoContasAPagar();
  const fluxo = getResumoFluxoCaixa();
  const convenios = getResumoConvenios();
  const comissoes = getResumoComissoes();
  const dre = getDreSimplificado();
  const inadimplentes = getPacientesInadimplentes();

  const totalInadimplencia = inadimplentes.reduce((total, item) => total + item.valorEmAberto, 0);

  const atalhos = [
    {
      href: "/financeiro/contas-a-receber",
      icon: HandCoins,
      titulo: "Contas a receber",
      descricao: "Cobranças, baixas e parcelamentos",
      valor: formatCurrency(receber.totalEmAberto),
      detalhe: `${receber.quantidadeEmAberto} em aberto`,
    },
    {
      href: "/financeiro/contas-a-pagar",
      icon: Receipt,
      titulo: "Contas a pagar",
      descricao: "Despesas fixas, variáveis e fornecedores",
      valor: formatCurrency(pagar.totalAPagar),
      detalhe: `${pagar.quantidadeAPagar} em aberto`,
    },
    {
      href: "/financeiro/fluxo-de-caixa",
      icon: LineChart,
      titulo: "Fluxo de caixa",
      descricao: "Entradas x saídas e DRE simplificado",
      valor: formatCurrency(fluxo.saldoMes),
      detalhe: "saldo do mês",
    },
    {
      href: "/financeiro/convenios",
      icon: ShieldCheck,
      titulo: "Faturamento de convênios",
      descricao: "Lotes de guias, glosas e reconciliação",
      valor: formatPercent(convenios.taxaGlosa),
      detalhe: "taxa de glosa",
    },
    {
      href: "/financeiro/comissoes",
      icon: Users,
      titulo: "Comissões",
      descricao: "Cálculo e fechamento da folha do corpo clínico",
      valor: formatCurrency(comissoes.totalPrevisto),
      detalhe: "previsto na competência",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Visão consolidada de recebimentos, despesas, convênios e comissões da clínica."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/relatorios">Relatórios financeiros</Link>
            </Button>
            <Button asChild>
              <Link href="/financeiro/contas-a-receber">
                <HandCoins />
                Contas a receber
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total a receber"
          value={formatCurrency(receber.totalEmAberto)}
          icon={Wallet}
          hint={`${receber.quantidadeEmAberto} cobranças · ${formatCurrency(receber.vencendo7Dias)} vencem em 7 dias`}
        />
        <StatCard
          label="Total a pagar"
          value={formatCurrency(pagar.totalAPagar)}
          icon={Receipt}
          hint={`${pagar.quantidadeAPagar} despesas · ${formatCurrency(pagar.vencendo7Dias)} vencem em 7 dias`}
        />
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(fluxo.saldoMes)}
          icon={Scale}
          variation={fluxo.variacaoSaldo}
          variationLabel="vs. mês anterior"
        />
        <StatCard
          label="Inadimplência"
          value={formatCurrency(totalInadimplencia)}
          icon={AlertTriangle}
          hint={`${inadimplentes.length} pacientes com cobranças em atraso`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <FluxoCaixaChart diario={getFluxoCaixaDiario()} mensal={getFluxoCaixaMensal()} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submódulos</CardTitle>
            <CardDescription>Atalhos para a rotina do setor financeiro</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border">
              {atalhos.map((atalho) => {
                const Icon = atalho.icon;
                return (
                  <li key={atalho.href}>
                    <Link
                      href={atalho.href}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{atalho.titulo}</p>
                        <p className="truncate text-xs text-muted-foreground">{atalho.descricao}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium tabular-nums text-foreground">{atalho.valor}</p>
                        <p className="text-xs text-muted-foreground">{atalho.detalhe}</p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DreSimplificado receitas={dre.receitas} despesas={dre.despesas} className="xl:col-span-2" />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-danger" />
              Maiores inadimplências
            </CardTitle>
            <CardDescription>Pacientes com cobranças vencidas em aberto</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {inadimplentes.length === 0 ? (
              <EmptyState
                title="Nenhuma inadimplência"
                description="Todas as cobranças vencidas foram liquidadas."
              />
            ) : (
              <ul className="divide-y divide-border">
                {inadimplentes.slice(0, 6).map(({ paciente, valorEmAberto }) => (
                  <li key={paciente.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/pacientes/${paciente.id}`}
                        className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {paciente.nome}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{paciente.telefone}</p>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-danger">
                      {formatCurrency(valorEmAberto)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
