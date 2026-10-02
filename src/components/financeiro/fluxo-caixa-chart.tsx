"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  chartAxisStyle,
  chartGridStyle,
  chartLegendStyle,
  chartTooltipStyle,
} from "@/lib/chart-theme";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import type { FluxoCaixaPonto } from "@/types";

interface FluxoCaixaChartProps {
  diario: FluxoCaixaPonto[];
  mensal: FluxoCaixaPonto[];
  title?: string;
  height?: number;
}

export function FluxoCaixaChart({
  diario,
  mensal,
  title = "Fluxo de caixa",
  height = 300,
}: FluxoCaixaChartProps) {
  const [periodo, setPeriodo] = React.useState<"30d" | "12m">("30d");
  const dados = periodo === "30d" ? diario : mensal;

  const totais = dados.reduce(
    (acumulado, ponto) => ({
      entradas: acumulado.entradas + ponto.entradas,
      saidas: acumulado.saidas + ponto.saidas,
      saldo: acumulado.saldo + ponto.saldo,
    }),
    { entradas: 0, saidas: 0, saldo: 0 },
  );

  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {periodo === "30d"
              ? "Entradas, saídas e saldo diário dos últimos 30 dias"
              : "Entradas, saídas e saldo mensal dos últimos 12 meses"}
          </CardDescription>
        </div>
        <div className="flex shrink-0 gap-1 self-start rounded-lg bg-muted p-1">
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
      <CardContent className="min-w-0 space-y-4 overflow-hidden">
        <div className="w-full min-w-0" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dados} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} {...chartGridStyle} />
              <XAxis dataKey="periodo" tick={chartAxisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                tick={chartAxisStyle}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(valor: number) => formatCurrencyCompact(valor)}
              />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(valor: number, nome: string) => [formatCurrency(valor), nome]} />
              <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={chartLegendStyle} />
              <Bar dataKey="entradas" name="Entradas" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="saidas" name="Saídas" fill="var(--color-danger)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Line type="monotone" dataKey="saldo" name="Saldo" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Entradas no período</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-success">{formatCurrency(totais.entradas)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saídas no período</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-danger">{formatCurrency(totais.saidas)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo acumulado</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatCurrency(totais.saldo)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
