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
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";

const CHART_COLORS = ["#0d5c6b", "#2a9d8f", "#e9c46a", "#f4a261", "#6b7fd7", "#8d99ae"];

const axisStyle = { fontSize: 11, fill: "#5c6b7a" };
const gridStyle = { stroke: "#e2e6ec" };

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e6ec",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(15, 26, 36, 0.08)",
};

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
                <stop offset="0%" stopColor="#0d5c6b" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#0d5c6b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} {...gridStyle} />
            <XAxis dataKey="periodo" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={70}
              tickFormatter={(valor: number) => formatCurrencyCompact(valor)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(valor: number) => [formatCurrency(valor), "Faturamento"]}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#0d5c6b"
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
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} {...gridStyle} />
            <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="profissional"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(valor: number) => [valor, "Atendimentos"]} />
            <Bar dataKey="atendimentos" fill="#0d5c6b" radius={[0, 6, 6, 0]} barSize={16} name="Atendimentos" />
          </BarChart>
        </ResponsiveContainer>
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
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={dados} dataKey="valor" nameKey="nome" cx="50%" cy="45%" innerRadius={58} outerRadius={88}>
              {dados.map((item, index) => (
                <Cell key={item.nome} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(valor: number, nome: string) => [
                `${valor} (${total > 0 ? Math.round((valor / total) * 100) : 0}%)`,
                nome,
              ]}
            />
            <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
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
