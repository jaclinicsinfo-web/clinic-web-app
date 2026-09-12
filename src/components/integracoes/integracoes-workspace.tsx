"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MessageCircle,
  Settings,
  Wallet,
} from "lucide-react";

import { Pode } from "@/components/auth/pode";
import { IntegracoesCharts } from "@/components/integracoes/integracoes-charts";
import { canalLabels, dicaCustoCobranca, tipoLembreteLabels } from "@/components/integracoes/labels";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatISODate, formatPercent } from "@/lib/format";
import {
  obterDashboardIntegracoesApi,
  type CanalLembrete,
  type FiltroIntegracoes,
  type IntegracoesDashboard,
  type StatusEnvio,
  type TipoLembrete,
} from "@/services/integracoes";

function inicioMes() {
  const hoje = new Date();
  return formatISODate(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
}

function hojeIso() {
  return formatISODate(new Date());
}

export function IntegracoesWorkspace() {
  const [dados, setDados] = React.useState<IntegracoesDashboard | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [filtro, setFiltro] = React.useState<FiltroIntegracoes>({ de: inicioMes(), ate: hojeIso() });
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    setErro(null);
    obterDashboardIntegracoesApi(filtro)
      .then((payload) => {
        if (ativo) setDados(payload);
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o dashboard.");
      });
    return () => {
      ativo = false;
    };
  }, [filtro.de, filtro.ate, filtro.canal, filtro.status, filtro.tipo, tentativa]);

  if (erro) {
    return (
      <EmptyState
        title="Não foi possível carregar"
        description={erro}
        action={
          <Button variant="outline" onClick={() => setTentativa((atual) => atual + 1)}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  if (!dados) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  const { resumo, cobranca } = dados;
  const ambosClinica = cobranca?.whatsapp !== "repasse_plataforma" && cobranca?.email !== "repasse_plataforma";
  const ambosRepasse = cobranca?.whatsapp === "repasse_plataforma" && cobranca?.email === "repasse_plataforma";
  const descricaoDashboard = ambosClinica
    ? "Lembretes gerados pela agenda. WhatsApp e e-mail cobram a clínica direto (Meta e SMTP). Os valores abaixo são estimativa da tabela vigente."
    : ambosRepasse
      ? "Lembretes gerados pela agenda, com custos a faturar pela plataforma."
      : "Lembretes gerados pela agenda. Cada canal pode cobrar a clínica direto ou ser faturado pela plataforma — veja a dica em cada card de custo.";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações e lembretes"
        description={descricaoDashboard}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/integracoes/historico">Histórico</Link>
            </Button>
            <Pode modulo="integracoes" acao="editar">
              <Button asChild>
                <Link href="/integracoes/configuracoes">
                  <Settings />
                  Configurações
                </Link>
              </Button>
            </Pode>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">De</span>
          <Input type="date" value={filtro.de ?? ""} onChange={(event) => setFiltro((atual) => ({ ...atual, de: event.target.value }))} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Até</span>
          <Input type="date" value={filtro.ate ?? ""} onChange={(event) => setFiltro((atual) => ({ ...atual, ate: event.target.value }))} />
        </label>
        <Select
          value={filtro.canal || "todos"}
          onValueChange={(valor) => setFiltro((atual) => ({ ...atual, canal: valor === "todos" ? "" : (valor as CanalLembrete) }))}
        >
          <SelectTrigger className="w-40"><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os canais</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtro.status || "todos"}
          onValueChange={(valor) => setFiltro((atual) => ({ ...atual, status: valor === "todos" ? "" : (valor as StatusEnvio) }))}
        >
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="falhou">Falhou</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtro.tipo || "todos"}
          onValueChange={(valor) => setFiltro((atual) => ({ ...atual, tipo: valor === "todos" ? "" : (valor as TipoLembrete) }))}
        >
          <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="antecedencia">Antecedência</SelectItem>
            <SelectItem value="confirmacao">Confirmação</SelectItem>
            <SelectItem value="reagendamento">Reagendamento</SelectItem>
            <SelectItem value="cancelamento">Cancelamento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de envios" value={String(resumo.total)} icon={MessageCircle} hint={`${resumo.hoje} hoje`} />
        <StatCard label="WhatsApp" value={String(resumo.whatsapp)} icon={MessageCircle} hint={`${resumo.email} por e-mail`} />
        <StatCard label="Enviados" value={String(resumo.enviados)} icon={CheckCircle2} hint={`${resumo.entregues} entregues · ${resumo.falhos} falhos`} />
        <StatCard label="Pendentes" value={String(resumo.pendentes)} icon={Clock} hint={`${resumo.agendamentosImpactados} agendamentos impactados`} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Custo total"
          value={formatCurrency(resumo.custoTotal)}
          icon={Wallet}
          hint={ambosClinica ? "Estimativa — cobrado na conta da clínica" : ambosRepasse ? "A faturar pela plataforma" : "Misto: veja WhatsApp e e-mail"}
        />
        <StatCard
          label="Custo WhatsApp"
          value={formatCurrency(resumo.custoWhatsapp)}
          icon={MessageCircle}
          hint={dicaCustoCobranca(cobranca?.whatsapp)}
        />
        <StatCard
          label="Custo e-mail"
          value={formatCurrency(resumo.custoEmail)}
          icon={Mail}
          hint={dicaCustoCobranca(cobranca?.email)}
        />
        <StatCard label="Custo médio" value={formatCurrency(resumo.custoMedio)} icon={Wallet} hint="Por envio no período" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Taxa de sucesso" value={formatPercent(resumo.taxaSucesso)} icon={CheckCircle2} />
        <StatCard label="Taxa de falha" value={formatPercent(resumo.taxaFalha)} icon={AlertTriangle} invertVariation />
        <StatCard label="Lembretes enviados" value={String(resumo.enviados)} icon={CalendarDays} />
        <StatCard label="Lembretes pendentes" value={String(resumo.pendentes)} icon={Clock} />
      </div>

      <IntegracoesCharts resumo={resumo} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Últimos envios</CardTitle>
            <CardDescription>Auditoria recente vinculada à agenda.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/integracoes/historico">Ver histórico</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {dados.envios.length === 0 ? (
            <EmptyState title="Nenhum envio no período" description="Quando a agenda gerar lembretes, eles aparecerão aqui." />
          ) : (
            <ul className="divide-y divide-border">
              {dados.envios.map((envio) => (
                <li key={envio.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{envio.destinatarioNome}</p>
                    <p className="text-xs text-muted-foreground">
                      {envio.agendamentoData ? formatDate(envio.agendamentoData) : "—"} {envio.agendamentoHora} · {canalLabels[envio.canal]} · {tipoLembreteLabels[envio.tipoLembrete]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatCurrency(envio.custo)}
                      {envio.custoEstimado ? " · estimado" : " · a faturar"}
                    </span>
                    <StatusBadge domain="envio" status={envio.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
