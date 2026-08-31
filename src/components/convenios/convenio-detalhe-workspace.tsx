"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, ExternalLink, Phone, ShieldCheck, Table2, Timer } from "lucide-react";

import { ConvenioTabelaPrecos } from "@/components/convenios/convenio-tabela-precos";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatPercent, formatPhone } from "@/lib/format";
import { obterConvenioApi, type IndicadoresConvenio, type PacienteConvenio } from "@/services/convenios";
import type { Convenio, Procedimento } from "@/types";

export function ConvenioDetalheWorkspace({ convenioId }: { convenioId: string }) {
  const [convenio, setConvenio] = React.useState<Convenio | null>(null);
  const [indicadores, setIndicadores] = React.useState<IndicadoresConvenio | null>(null);
  const [pacientes, setPacientes] = React.useState<PacienteConvenio[]>([]);
  const [procedimentos, setProcedimentos] = React.useState<Procedimento[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await obterConvenioApi(convenioId);
      setConvenio(data.convenio);
      setIndicadores(data.indicadores);
      setPacientes(data.pacientes);
      setProcedimentos(data.procedimentos);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o convênio.");
    } finally {
      setCarregando(false);
    }
  }, [convenioId]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando convênio" />
      </div>
    );
  }

  if (erro || !convenio || !indicadores) {
    return (
      <EmptyState
        title="Convênio não encontrado"
        description={erro ?? "O registro pode ter sido removido."}
        action={
          <Button variant="outline" asChild>
            <Link href="/convenios">Voltar para convênios</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{convenio.nome}</h1>
              <StatusBadge domain="generico" status={convenio.status} />
              {convenio.exigeAutorizacaoPrevia && <Badge tone="warning">Exige autorização prévia</Badge>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              {convenio.registroAns && <span>ANS {convenio.registroAns}</span>}
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {convenio.contatoNome} · {formatPhone(convenio.contatoTelefone)}
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="size-3.5" />
                Prazo médio {convenio.prazoPagamentoDias} dias
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {convenio.portalUrl && (
              <Button variant="outline" asChild>
                <a href={convenio.portalUrl} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Portal
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href={`/financeiro/convenios?convenio=${convenio.id}`}>
                <Table2 />
                Faturamento
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pacientes vinculados</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{indicadores.pacientesVinculados}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Atendimentos no mês</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{indicadores.atendimentosMes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Faturamento do mês</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{formatCurrency(indicadores.faturamentoMes)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Taxa de glosa</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{formatPercent(indicadores.taxaGlosa)}</p>
        </Card>
      </div>

      <ConvenioTabelaPrecos convenio={convenio} procedimentos={procedimentos} onSalvo={carregar} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Pacientes vinculados
          </CardTitle>
          <CardDescription>Cadastros com este convênio como plano principal.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {pacientes.length === 0 ? (
            <EmptyState title="Nenhum paciente vinculado" description="O convênio ainda não está associado a cadastros." />
          ) : (
            <ul className="divide-y divide-border">
              {pacientes.map((paciente) => (
                <li key={paciente.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/pacientes/${paciente.id}`}
                      className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {paciente.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Carteirinha {paciente.numeroCarteirinha ?? "—"}
                    </p>
                  </div>
                  <StatusBadge domain="paciente" status={paciente.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
