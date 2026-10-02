"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Cake,
  DollarSign,
  Percent,
  TrendingDown,
  UserPlus,
  Wallet,
} from "lucide-react";

import { Pode } from "@/components/auth/pode";
import {
  AtendimentosPorProfissionalChart,
  FaturamentoChart,
  FunilAgendamentosChart,
  OrigemAtendimentoChart,
} from "@/components/dashboard/dashboard-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/format";
import { obterDashboardApi, type DashboardPayload } from "@/services/dashboard";

function diaMes(iso: string) {
  if (iso.length < 10) return iso;
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function DashboardWorkspace() {
  const [dados, setDados] = React.useState<DashboardPayload | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    setErro(null);
    setDados(null);
    obterDashboardApi()
      .then((payload) => {
        if (ativo) setDados(payload);
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o dashboard.");
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  if (erro) {
    return (
      <EmptyState
        title="Não foi possível carregar"
        description={erro}
        action={
          <Button variant="outline" onClick={() => setTentativa((atual) => atual + 1)}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  if (!dados) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const dia = dados.atendimentosHoje;
  const financeiro = dados.financeiro;

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão consolidada da operação da clínica no dia e no mês corrente."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Pode modulo="relatorios">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/relatorios">Ver relatórios</Link>
              </Button>
            </Pode>
            <Pode modulo="agenda">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/agenda">
                  <CalendarDays />
                  Abrir agenda
                </Link>
              </Button>
            </Pode>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Atendimentos hoje"
          value={String(dia.total)}
          icon={CalendarCheck}
          hint={`${dia.confirmados} confirmados · ${dia.agendados} agendados · ${dia.cancelados} cancelados`}
        />
        {financeiro ? (
          <Pode modulo="financeiro">
            <StatCard
              label="Faturamento do mês"
              value={formatCurrency(financeiro.faturamentoMes)}
              icon={DollarSign}
              variation={financeiro.variacaoFaturamento}
            />
          </Pode>
        ) : null}
        <StatCard
          label="Taxa de ocupação"
          value={formatPercent(dados.taxaOcupacao)}
          icon={Percent}
          hint="Capacidade da agenda no mês corrente"
        />
        <StatCard
          label="Taxa de faltas"
          value={formatPercent(dados.taxaFaltas)}
          icon={TrendingDown}
          hint="No-show sobre o total de agendamentos"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Novos pacientes no mês"
          value={String(dados.novosPacientes)}
          icon={UserPlus}
          variation={dados.variacaoNovosPacientes}
        />
        {financeiro ? (
          <>
            <Pode modulo="financeiro">
              <StatCard
                label="Previsto para hoje"
                value={formatCurrency(financeiro.faturamentoDia)}
                icon={Wallet}
                hint="Soma dos atendimentos ativos do dia"
              />
            </Pode>
            <Pode modulo="financeiro">
              <StatCard
                label="A receber em 7 dias"
                value={formatCurrency(financeiro.contasAReceber.vencendo7Dias)}
                icon={ArrowRight}
                hint={`${financeiro.contasAReceber.quantidadeVencendo7Dias} cobranças · ${formatCurrency(financeiro.contasAReceber.totalAtrasado)} em atraso`}
              />
            </Pode>
            <Pode modulo="financeiro">
              <StatCard
                label="A pagar em 7 dias"
                value={formatCurrency(financeiro.contasAPagar.vencendo7Dias)}
                icon={AlertTriangle}
                hint={`${financeiro.contasAPagar.quantidadeVencendo7Dias} despesas · ${formatCurrency(financeiro.contasAPagar.totalVencido)} vencidas`}
              />
            </Pode>
          </>
        ) : null}
      </div>

      {financeiro ? (
        <Pode modulo="financeiro">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <FaturamentoChart diario={financeiro.faturamentoDiario} mensal={financeiro.faturamentoMensal} />
            </div>
            <OrigemAtendimentoChart dados={financeiro.origemAtendimento} />
          </div>
        </Pode>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AtendimentosPorProfissionalChart dados={dados.atendimentosPorProfissional} />
        <FunilAgendamentosChart dados={dados.funil} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Próximos atendimentos</CardTitle>
              <CardDescription>Agenda do restante do dia</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start">
              <Link href="/agenda">
                Ver agenda
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="min-w-0 px-0 pb-0">
            {dados.proximos.length === 0 ? (
              <EmptyState
                title="Nenhum atendimento restante hoje"
                description="Todos os horários do dia já foram concluídos ou não há agendamentos futuros."
                icon={CalendarCheck}
              />
            ) : (
              <ul className="divide-y divide-border">
                {dados.proximos.map((agendamento) => (
                  <li key={agendamento.id} className="flex items-start gap-3 px-4 py-3 sm:items-center sm:gap-4 sm:px-5">
                    <div className="w-12 shrink-0 text-sm font-semibold tabular-nums text-foreground sm:w-14">
                      {agendamento.horaInicio}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/pacientes/${agendamento.pacienteId}`}
                        className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {agendamento.pacienteNome}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {agendamento.procedimentoNome} · {agendamento.profissionalNome}
                        {agendamento.sala ? ` · ${agendamento.sala}` : ""}
                      </p>
                      <div className="mt-1.5 sm:hidden">
                        <StatusBadge domain="agendamento" status={agendamento.status} />
                      </div>
                    </div>
                    {financeiro ? (
                      <Pode modulo="financeiro">
                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="text-sm font-medium tabular-nums text-foreground">
                            {formatCurrency(agendamento.valor)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {agendamento.particular ? "Particular" : "Convênio"}
                          </p>
                        </div>
                      </Pode>
                    ) : null}
                    <div className="hidden shrink-0 sm:block">
                      <StatusBadge domain="agendamento" status={agendamento.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {financeiro ? (
            <Pode modulo="financeiro">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-warning" />
                    Alertas
                  </CardTitle>
                  <CardDescription>Pontos que exigem atenção da gestão</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {financeiro.alertas.length === 0 ? (
                    <p className="px-5 pb-5 text-sm text-muted-foreground">Nenhum alerta ativo.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {financeiro.alertas.map((alerta) => (
                        <li key={alerta.id} className="px-5 py-3">
                          <Link href={alerta.href} className="block rounded-md hover:bg-muted/50">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-foreground">{alerta.titulo}</p>
                              <Badge tone={alerta.severidade === "alta" ? "danger" : "warning"}>
                                {alerta.severidade === "alta" ? "Alta" : "Média"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{alerta.descricao}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </Pode>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="size-4 text-primary" />
                Aniversariantes do mês
              </CardTitle>
              <CardDescription>Oportunidade de contato e relacionamento</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {dados.aniversariantes.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-muted-foreground">Nenhum aniversariante neste mês.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {dados.aniversariantes.map((paciente) => (
                    <li key={paciente.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <Link
                          href={`/pacientes/${paciente.id}`}
                          className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {paciente.nome}
                        </Link>
                        <p className="text-xs text-muted-foreground">{paciente.idade} anos</p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {diaMes(paciente.dataNascimento)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
