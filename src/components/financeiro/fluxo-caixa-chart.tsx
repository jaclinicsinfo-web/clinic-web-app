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
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import type { FluxoCaixaPonto } from "@/types";

const axisStyle = { fontSize: 11, fill: "#5c6b7a" };
const gridStyle = { stroke: "#e2e6ec" };

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e6ec",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(15, 26, 36, 0.08)",
};

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
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {periodo === "30d"
              ? "Entradas, saídas e saldo diário dos últimos 30 dias"
              : "Entradas, saídas e saldo mensal dos últimos 12 meses"}
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
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} {...gridStyle} />
            <XAxis dataKey="periodo" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={70}
              tickFormatter={(valor: number) => formatCurrencyCompact(valor)}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(valor: number, nome: string) => [formatCurrency(valor), nome]} />
            <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="entradas" name="Entradas" fill="#2a9d8f" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="saidas" name="Saídas" fill="#f4a261" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#0d5c6b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>

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
