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
import {
  CHART_COLORS,
  chartAxisStyle,
  chartCursorFill,
  chartGridStyle,
  chartLegendStyle,
  chartTooltipStyle,
} from "@/lib/chart-theme";

export { CHART_COLORS };

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
    <div className="h-full w-full min-w-0" style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRelatorio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} {...chartGridStyle} />
          <XAxis dataKey="periodo" tick={chartAxisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={chartAxisStyle}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(valor: number) => formatCurrencyCompact(valor)}
          />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(valor: number) => [formatCurrency(valor), nomeSerie]} />
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
    </div>
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
    <div className="w-full min-w-0" style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dados}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={!horizontal} vertical={horizontal} {...chartGridStyle} />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={chartAxisStyle}
                tickLine={false}
                axisLine={false}
                tickFormatter={(valor: number) => (moeda ? formatCurrencyCompact(valor) : formatNumber(valor))}
              />
              <YAxis
                type="category"
                dataKey={categoria}
                tick={chartAxisStyle}
                tickLine={false}
                axisLine={false}
                width={Math.min(larguraCategoria, 96)}
                tickFormatter={(valor: string) => (String(valor).length > 12 ? `${String(valor).slice(0, 11)}…` : String(valor))}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={categoria} tick={chartAxisStyle} tickLine={false} axisLine={false} interval={0} height={48} />
              <YAxis
                tick={chartAxisStyle}
                tickLine={false}
                axisLine={false}
                width={moeda ? 56 : 40}
                tickFormatter={(valor: number) => (moeda ? formatCurrencyCompact(valor) : formatNumber(valor))}
              />
            </>
          )}
          <Tooltip
            contentStyle={chartTooltipStyle}
            cursor={{ fill: chartCursorFill }}
            formatter={(valor: number, nome: string) => [formatarValor(valor, moeda), nome]}
          />
          {mostrarLegenda && <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={chartLegendStyle} />}
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
    </div>
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
    <div className="w-full min-w-0" style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={dados} dataKey="valor" nameKey="nome" cx="50%" cy="45%" innerRadius={50} outerRadius={78}>
            {dados.map((item, index) => (
              <Cell key={item.nome} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(valor: number, nome: string) => [
              `${formatarValor(valor, moeda)} (${total > 0 ? Math.round((valor / total) * 100) : 0}%)`,
              nome,
            ]}
          />
          <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={chartLegendStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
