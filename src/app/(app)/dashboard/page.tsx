import type { Metadata } from "next";
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

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AtendimentosPorProfissionalChart,
  FaturamentoChart,
  FunilAgendamentosChart,
  OrigemAtendimentoChart,
} from "@/components/dashboard/dashboard-charts";
import { calculateAge, formatCurrency, formatDate, formatPercent } from "@/lib/format";
import {
  getAlertas,
  getAniversariantes,
  getAtendimentosPorProfissional,
  getDistribuicaoConvenioParticular,
  getFaturamentoUltimos12Meses,
  getFaturamentoUltimos30Dias,
  getFunilDoMes,
  getIndicadoresDashboard,
} from "@/services/dashboard";
import { getProximosAtendimentos } from "@/services/agenda";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const indicadores = getIndicadoresDashboard();
  const proximos = getProximosAtendimentos(6);
  const alertas = getAlertas();
  const aniversariantes = getAniversariantes();

  const dia = indicadores.atendimentosHoje;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão consolidada da operação da clínica no dia e no mês corrente."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/relatorios">Ver relatórios</Link>
            </Button>
            <Button asChild>
              <Link href="/agenda">
                <CalendarDays />
                Abrir agenda
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Atendimentos hoje"
          value={String(dia.total)}
          icon={CalendarCheck}
          hint={`${dia.confirmados} confirmados · ${dia.agendados} agendados · ${dia.cancelados} cancelados`}
        />
        <StatCard
          label="Faturamento do mês"
          value={formatCurrency(indicadores.faturamentoMes)}
          icon={DollarSign}
          variation={indicadores.variacaoFaturamento}
        />
        <StatCard
          label="Taxa de ocupação"
          value={formatPercent(indicadores.taxaOcupacao)}
          icon={Percent}
          hint="Capacidade da agenda no mês corrente"
        />
        <StatCard
          label="Taxa de faltas"
          value={formatPercent(indicadores.taxaFaltas)}
          icon={TrendingDown}
          hint="No-show sobre o total de agendamentos"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Novos pacientes no mês"
          value={String(indicadores.novosPacientes)}
          icon={UserPlus}
          variation={indicadores.variacaoNovosPacientes}
        />
        <StatCard
          label="Previsto para hoje"
          value={formatCurrency(indicadores.faturamentoDia)}
          icon={Wallet}
          hint="Soma dos atendimentos ativos do dia"
        />
        <StatCard
          label="A receber em 7 dias"
          value={formatCurrency(indicadores.contasAReceber.vencendo7Dias)}
          icon={ArrowRight}
          hint={`${indicadores.contasAReceber.quantidadeVencendo7Dias} cobranças · ${formatCurrency(indicadores.contasAReceber.totalAtrasado)} em atraso`}
        />
        <StatCard
          label="A pagar em 7 dias"
          value={formatCurrency(indicadores.contasAPagar.vencendo7Dias)}
          icon={AlertTriangle}
          hint={`${indicadores.contasAPagar.quantidadeVencendo7Dias} despesas · ${formatCurrency(indicadores.contasAPagar.totalVencido)} vencidas`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <FaturamentoChart diario={getFaturamentoUltimos30Dias()} mensal={getFaturamentoUltimos12Meses()} />
        </div>
        <OrigemAtendimentoChart dados={getDistribuicaoConvenioParticular()} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AtendimentosPorProfissionalChart dados={getAtendimentosPorProfissional()} />
        <FunilAgendamentosChart dados={getFunilDoMes()} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Próximos atendimentos</CardTitle>
              <CardDescription>Agenda do restante do dia</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agenda">
                Ver agenda
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {proximos.length === 0 ? (
              <EmptyState
                title="Nenhum atendimento restante hoje"
                description="Todos os horários do dia já foram concluídos ou não há agendamentos futuros."
                icon={CalendarCheck}
              />
            ) : (
              <ul className="divide-y divide-border">
                {proximos.map((agendamento) => (
                  <li key={agendamento.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-14 shrink-0 text-sm font-semibold tabular-nums text-foreground">
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
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(agendamento.valor)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agendamento.particular ? "Particular" : "Convênio"}
                      </p>
                    </div>
                    <StatusBadge domain="agendamento" status={agendamento.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" />
                Alertas
              </CardTitle>
              <CardDescription>Pontos que exigem atenção da gestão</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {alertas.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-muted-foreground">Nenhum alerta ativo.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {alertas.map((alerta) => (
                    <li key={alerta.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{alerta.titulo}</p>
                        <Badge tone={alerta.severidade === "alta" ? "danger" : "warning"}>
                          {alerta.severidade === "alta" ? "Alta" : "Média"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{alerta.descricao}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="size-4 text-primary" />
                Aniversariantes do mês
              </CardTitle>
              <CardDescription>Oportunidade de contato e relacionamento</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {aniversariantes.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-muted-foreground">Nenhum aniversariante neste mês.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {aniversariantes.map((paciente) => (
                    <li key={paciente.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <Link
                          href={`/pacientes/${paciente.id}`}
                          className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {paciente.nome}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {calculateAge(paciente.dataNascimento) + 1} anos
                        </p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatDate(paciente.dataNascimento).slice(0, 5)}
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
