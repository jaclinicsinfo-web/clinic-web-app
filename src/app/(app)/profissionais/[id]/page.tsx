"use client";

import { CalendarCheck, Percent, TrendingUp, Users } from "lucide-react";

import { useProfissionalPerfil } from "@/components/profissionais/profissional-perfil-shell";
import { GradeHorarios } from "@/components/profissionais/grade-horarios";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { formaRemuneracaoLabels, tipoVinculoLabels } from "@/lib/status";
import { Pode } from "@/components/auth/pode";

export default function ProfissionalVisaoGeralPage() {
  const { profissional, indicadores, procedimentosHabilitados } = useProfissionalPerfil();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Atendimentos no mês" value={String(indicadores.atendimentosMes)} icon={CalendarCheck} />
        <Pode modulo="financeiro">
          <StatCard label="Faturamento gerado" value={formatCurrency(indicadores.faturamentoGerado)} icon={TrendingUp} />
        </Pode>
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
                { termo: "Admissão", valor: formatDate(profissional.dataAdmissao) },
                { termo: "Conselho", valor: `${profissional.conselho} ${profissional.registroConselho}` },
                { termo: "Horas semanais", valor: `${indicadores.horasSemanais.toLocaleString("pt-BR")} h` },
              ].map((item) => (
                <div key={item.termo} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{item.termo}</dt>
                  <dd className="font-medium text-foreground">{item.valor}</dd>
                </div>
              ))}
              <Pode modulo="financeiro">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Comissão</dt>
                  <dd className="font-medium text-foreground">{formatPercent(profissional.percentualComissao)}</dd>
                </div>
              </Pode>
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
          {procedimentosHabilitados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum procedimento habilitado.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {procedimentosHabilitados.map((procedimento) => (
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
