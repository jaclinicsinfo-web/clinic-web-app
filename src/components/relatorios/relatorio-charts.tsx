"use client";

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

import { formatCurrency, formatCurrencyCompact, formatNumber } from "@/lib/format";

export const CHART_COLORS = ["#0d5c6b", "#2a9d8f", "#e9c46a", "#f4a261", "#6b7fd7"];

const axisStyle = { fontSize: 11, fill: "#5c6b7a" };
const gridStyle = { stroke: "#e2e6ec" };

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e6ec",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(15, 26, 36, 0.08)",
};

export interface SerieRelatorio {
  key: string;
  nome: string;
  cor: string;
}

type LinhaGrafico = Record<string, string | number>;

function formatarValor(valor: number, moeda: boolean) {
  return moeda ? formatCurrency(valor) : formatNumber(valor);
}

export function GraficoEvolucao({
  dados,
  nomeSerie = "Faturamento",
  altura = 260,
}: {
  dados: { periodo: string; valor: number }[];
  nomeSerie?: string;
  altura?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <AreaChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRelatorio" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.28} />
            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
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
        <Tooltip contentStyle={tooltipStyle} formatter={(valor: number) => [formatCurrency(valor), nomeSerie]} />
        <Area
          type="monotone"
          dataKey="valor"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          fill="url(#gradRelatorio)"
          name={nomeSerie}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GraficoBarras({
  dados,
  categoria,
  series,
  moeda = false,
  altura = 280,
  horizontal = false,
  larguraCategoria = 130,
}: {
  dados: LinhaGrafico[];
  categoria: string;
  series: SerieRelatorio[];
  moeda?: boolean;
  altura?: number;
  horizontal?: boolean;
  larguraCategoria?: number;
}) {
  const mostrarLegenda = series.length > 1;

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart
        data={dados}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={!horizontal} vertical={horizontal} {...gridStyle} />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(valor: number) => (moeda ? formatCurrencyCompact(valor) : formatNumber(valor))}
            />
            <YAxis
              type="category"
              dataKey={categoria}
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={larguraCategoria}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={categoria} tick={axisStyle} tickLine={false} axisLine={false} interval={0} height={48} />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={moeda ? 70 : 44}
              tickFormatter={(valor: number) => (moeda ? formatCurrencyCompact(valor) : formatNumber(valor))}
            />
          </>
        )}
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(13, 92, 107, 0.06)" }}
          formatter={(valor: number, nome: string) => [formatarValor(valor, moeda), nome]}
        />
        {mostrarLegenda && <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((serie) => (
          <Bar
            key={serie.key}
            dataKey={serie.key}
            name={serie.nome}
            fill={serie.cor}
            radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            barSize={horizontal ? 16 : 28}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoPizza({
  dados,
  moeda = false,
  altura = 260,
}: {
  dados: { nome: string; valor: number }[];
  moeda?: boolean;
  altura?: number;
}) {
  const total = dados.reduce((soma, item) => soma + item.valor, 0);

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <PieChart>
        <Pie data={dados} dataKey="valor" nameKey="nome" cx="50%" cy="45%" innerRadius={58} outerRadius={88}>
          {dados.map((item, index) => (
            <Cell key={item.nome} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(valor: number, nome: string) => [
            `${formatarValor(valor, moeda)} (${total > 0 ? Math.round((valor / total) * 100) : 0}%)`,
            nome,
          ]}
        />
        <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
