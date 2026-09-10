"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartGridStyle,
  chartLegendStyle,
  chartTooltipStyle,
} from "@/lib/chart-theme";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";

interface SerieValor {
  periodo: string;
  valor: number;
}

export function FaturamentoChart({
  diario,
  mensal,
}: {
  diario: SerieValor[];
  mensal: SerieValor[];
}) {
  const [periodo, setPeriodo] = React.useState<"30d" | "12m">("30d");
  const dados = periodo === "30d" ? diario : mensal;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Faturamento</CardTitle>
          <CardDescription>
            {periodo === "30d" ? "Receita recebida nos últimos 30 dias" : "Receita recebida nos últimos 12 meses"}
          </CardDescription>
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg bg-muted p-1">
          <Button
            size="sm"
            variant={periodo === "30d" ? "default" : "ghost"}
            onClick={() => setPeriodo("30d")}
            className="h-7"
          >
            30 dias
          </Button>
          <Button
            size="sm"
            variant={periodo === "12m" ? "default" : "ghost"}
            onClick={() => setPeriodo("12m")}
            className="h-7"
          >
            12 meses
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradFaturamento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} {...chartGridStyle} />
            <XAxis dataKey="periodo" tick={chartAxisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={chartAxisStyle}
              tickLine={false}
              axisLine={false}
              width={70}
              tickFormatter={(valor: number) => formatCurrencyCompact(valor)}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(valor: number) => [formatCurrency(valor), "Faturamento"]}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#gradFaturamento)"
              name="Faturamento"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AtendimentosPorProfissionalChart({
  dados,
}: {
  dados: { profissional: string; atendimentos: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atendimentos por profissional</CardTitle>
        <CardDescription>Atendimentos realizados no mês corrente</CardDescription>
      </CardHeader>
      <CardContent>
        {dados.length === 0 ? (
          <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Nenhum profissional ativo neste período.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} {...chartGridStyle} />
              <XAxis type="number" tick={chartAxisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="profissional"
                tick={chartAxisStyle}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(valor: number) => [valor, "Atendimentos"]} />
              <Bar dataKey="atendimentos" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} barSize={16} name="Atendimentos" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function OrigemAtendimentoChart({ dados }: { dados: { nome: string; valor: number }[] }) {
  const total = dados.reduce((soma, item) => soma + item.valor, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convênio x Particular</CardTitle>
        <CardDescription>Distribuição dos atendimentos do mês</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Nenhum atendimento realizado neste mês.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={dados} dataKey="valor" nameKey="nome" cx="50%" cy="45%" innerRadius={58} outerRadius={88}>
                {dados.map((item, index) => (
                  <Cell key={item.nome} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(valor: number, nome: string) => [
                  `${valor} (${Math.round((valor / total) * 100)}%)`,
                  nome,
                ]}
              />
              <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={chartLegendStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function FunilAgendamentosChart({ dados }: { dados: { etapa: string; quantidade: number }[] }) {
  const maior = Math.max(...dados.map((item) => item.quantidade), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de agendamentos</CardTitle>
        <CardDescription>Do agendamento ao desfecho, no mês corrente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dados.map((item, index) => {
          const percentual = (item.quantidade / maior) * 100;
          return (
            <div key={item.etapa}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-medium text-foreground">{item.etapa}</span>
                <span className="tabular-nums text-muted-foreground">
                  {item.quantidade}
                  <span className="ml-1.5 text-xs">
                    ({maior > 0 ? Math.round((item.quantidade / maior) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentual}%`,
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
