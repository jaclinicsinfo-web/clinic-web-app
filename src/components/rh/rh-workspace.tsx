"use client";

import * as React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, Clock, FileText, UserCheck, UserX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { temPermissao } from "@/lib/permissoes";
import { isAdminOuGestor } from "@/lib/plano";
import { horaOuTraco } from "@/components/rh/labels";
import { obterVisaoRhApi, type VisaoRh } from "@/services/rh";

function formatCompetencia(competencia: string) {
  return format(parseISO(`${competencia}-01`), "MMMM 'de' yyyy", { locale: ptBR });
}

export function RhWorkspace() {
  const sessao = useSessaoStore((state) => state.sessao);
  const podeBater = temPermissao(sessao?.permissoes, "rh", "criar");
  const [dados, setDados] = React.useState<VisaoRh | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;
    obterVisaoRhApi()
      .then((payload) => {
        if (ativo) setDados(payload);
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o RH.");
      });
    return () => {
      ativo = false;
    };
  }, []);

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  if (!dados) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { resumo } = dados;
  const competencia = formatCompetencia(dados.competencia);
  const somenteProprios = dados.somenteProprios ?? !isAdminOuGestor(sessao?.perfil);

  const atalhos = [
    {
      href: "/rh/ponto",
      icon: Clock,
      titulo: somenteProprios ? "Meu ponto" : "Controle de ponto",
      descricao: somenteProprios
        ? "Entrada, intervalo e saída do seu dia"
        : "Entrada, intervalo e saída dos usuários",
      valor: String(resumo.presentesHoje),
      detalhe: somenteProprios ? (resumo.presentesHoje ? "registrado hoje" : "sem batida hoje") : "presentes hoje",
    },
    {
      href: "/rh/holerites",
      icon: FileText,
      titulo: somenteProprios ? "Meus holerites" : "Holerites",
      descricao: somenteProprios ? "Contracheques disponíveis para você" : "Contracheques por competência",
      valor: String(resumo.holeritesCompetencia),
      detalhe: competencia,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="RH"
        description={
          somenteProprios
            ? "Seu ponto do dia e os holerites disponibilizados para você."
            : "Controle de ponto dos usuários e holerites da clínica."
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/rh/holerites">{somenteProprios ? "Meus holerites" : "Holerites"}</Link>
            </Button>
            <Button asChild>
              <Link href="/rh/ponto">
                <Clock />
                {somenteProprios ? "Meu ponto" : "Controle de ponto"}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={somenteProprios ? "Ponto de hoje" : "Presentes hoje"}
          value={somenteProprios ? (resumo.presentesHoje ? "Registrado" : "Pendente") : String(resumo.presentesHoje)}
          icon={UserCheck}
          hint={somenteProprios ? (podeBater ? "Use a tela de ponto para bater o horário" : "Aguardando sua primeira batida") : `${resumo.usuariosAtivos} usuários ativos`}
        />
        <StatCard
          label={somenteProprios ? "Status" : "Ausentes hoje"}
          value={somenteProprios ? (resumo.incompletosHoje ? "Em andamento" : resumo.presentesHoje ? "Completo" : "Sem batida") : String(resumo.ausentesHoje)}
          icon={UserX}
          hint={somenteProprios ? "Situação do seu registro no dia" : "Usuários ativos sem batida de entrada"}
        />
        <StatCard
          label={somenteProprios ? "Saída pendente" : "Ponto em aberto"}
          value={String(resumo.incompletosHoje)}
          icon={Clock}
          hint="Entrada registrada sem horário de saída"
        />
        <StatCard
          label={somenteProprios ? "Holerites do mês" : "Holerites do mês"}
          value={String(resumo.holeritesCompetencia)}
          icon={FileText}
          hint={
            somenteProprios
              ? resumo.holeritesCompetencia
                ? `Disponível em ${competencia}`
                : `Ainda não enviado em ${competencia}`
              : `${resumo.semHolerite} usuários ainda sem arquivo em ${competencia}`
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Ponto de hoje</CardTitle>
            <CardDescription>{formatDate(dados.hoje)} · batidas registradas nesta data</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {dados.pontoHoje.length === 0 ? (
              <EmptyState
                title={somenteProprios ? "Você ainda não bateu ponto hoje" : "Nenhuma batida hoje"}
                description={
                  somenteProprios
                    ? "Abra Meu ponto para registrar a entrada."
                    : "Lance o ponto dos usuários ou registre o seu próprio horário."
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {dados.pontoHoje.slice(0, 8).map((registro) => (
                  <li key={registro.id} className="flex items-center justify-between gap-3 px-6 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{registro.usuarioNome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {horaOuTraco(registro.entrada)} → {horaOuTraco(registro.saida)}
                        {registro.horasTrabalhadas ? ` · ${registro.horasTrabalhadas}` : ""}
                      </p>
                    </div>
                    <StatusBadge domain="ponto" status={registro.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submódulos</CardTitle>
            <CardDescription>{somenteProprios ? "Seu ponto e seus holerites" : "Atalhos da rotina de RH"}</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border">
              {atalhos.map((atalho) => {
                const Icon = atalho.icon;
                return (
                  <li key={atalho.href}>
                    <Link
                      href={atalho.href}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{atalho.titulo}</p>
                        <p className="truncate text-xs text-muted-foreground">{atalho.descricao}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium tabular-nums text-foreground">{atalho.valor}</p>
                        <p className="text-xs text-muted-foreground">{atalho.detalhe}</p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
