"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartGridStyle,
  chartTooltipStyle,
} from "@/lib/chart-theme";
import { formatNumber } from "@/lib/format";
import type { IntegracoesResumo } from "@/services/integracoes";

export function IntegracoesCharts({ resumo }: { resumo: IntegracoesResumo }) {
  const canais = [{ nome: "WhatsApp", valor: resumo.whatsapp }];
  const status = [
    { nome: "Enviados", valor: resumo.enviados },
    { nome: "Entregues", valor: resumo.entregues },
    { nome: "Pendentes", valor: resumo.pendentes },
    { nome: "Falhos", valor: resumo.falhos },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Envios por canal</CardTitle>
          <CardDescription>Volume no período filtrado.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={canais} dataKey="valor" nameKey="nome" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {canais.map((item, index) => (
                  <Cell key={item.nome} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(valor: number) => [formatNumber(valor), "Envios"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status dos envios</CardTitle>
          <CardDescription>Distribuição operacional no período.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={status}>
              <CartesianGrid strokeDasharray="3 3" style={chartGridStyle} />
              <XAxis dataKey="nome" tick={chartAxisStyle} />
              <YAxis tick={chartAxisStyle} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="valor" name="Quantidade" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
