import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, Percent, TrendingUp, Users } from "lucide-react";

import { GradeHorarios } from "@/components/profissionais/grade-horarios";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { formaRemuneracaoLabels, tipoVinculoLabels } from "@/lib/status";
import { listProcedimentos } from "@/services/catalogo";
import { getIndicadoresProfissional, getProfissionalById } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profissional = getProfissionalById(id);
  return { title: profissional?.nome ?? "Profissional não encontrado" };
}

export default async function ProfissionalVisaoGeralPage({ params }: PageProps) {
  const { id } = await params;
  const profissional = getProfissionalById(id);

  if (!profissional) notFound();

  const indicadores = getIndicadoresProfissional(id);
  const procedimentos = listProcedimentos().filter((procedimento) =>
    profissional.procedimentosHabilitados.includes(procedimento.id),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Atendimentos no mês" value={String(indicadores.atendimentosMes)} icon={CalendarCheck} />
        <StatCard label="Faturamento gerado" value={formatCurrency(indicadores.faturamentoGerado)} icon={TrendingUp} />
        <StatCard label="Taxa de ocupação" value={formatPercent(indicadores.taxaOcupacao)} icon={Percent} />
        <StatCard
          label="Pacientes atendidos"
          value={String(indicadores.pacientesAtendidos)}
          icon={Users}
          hint={`${formatPercent(indicadores.taxaFaltas)} de faltas no mês`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              {[
                { termo: "Vínculo", valor: tipoVinculoLabels[profissional.tipoVinculo] },
                { termo: "Remuneração", valor: formaRemuneracaoLabels[profissional.formaRemuneracao] },
                { termo: "Comissão", valor: formatPercent(profissional.percentualComissao) },
                { termo: "Admissão", valor: formatDate(profissional.dataAdmissao) },
                { termo: "Conselho", valor: `${profissional.conselho} ${profissional.registroConselho}` },
                { termo: "Horas semanais", valor: `${indicadores.horasSemanais.toLocaleString("pt-BR")} h` },
              ].map((item) => (
                <div key={item.termo} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{item.termo}</dt>
                  <dd className="font-medium text-foreground">{item.valor}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <GradeHorarios grade={profissional.gradeHorarios} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procedimentos habilitados</CardTitle>
        </CardHeader>
        <CardContent>
          {procedimentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum procedimento habilitado.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {procedimentos.map((procedimento) => (
                <Badge key={procedimento.id} tone="outline">
                  {procedimento.nome}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
