"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, HeartPulse, Pill, Receipt, Stethoscope } from "lucide-react";

import { usePacientePerfil } from "@/components/pacientes/paciente-perfil-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatDateLong } from "@/lib/format";
import { estadoCivilLabels, sexoLabels } from "@/lib/status";

function nomeConvenio(convenioId: string | null, convenioNome?: string | null) {
  if (convenioNome) return convenioNome;
  return convenioId ? "Convênio" : "Particular";
}

export function PacienteVisaoGeral() {
  const { paciente, detalhe } = usePacientePerfil();
  const id = paciente.id;

  const proximos = detalhe.proximosAgendamentos.slice(0, 4);
  const ultimasVisitas = detalhe.atendimentos.slice(0, 4);
  const acompanhamentos = detalhe.acompanhamentos;
  const acompanhamentoAtivo = acompanhamentos.find((item) => item.status === "em_andamento") ?? acompanhamentos[0];
  const evolucaoAtiva = acompanhamentoAtivo
    ? detalhe.atendimentos.filter((item) => item.acompanhamentoId === acompanhamentoAtivo.id)
    : [];
  const quadroAtual =
    acompanhamentoAtivo?.resumoAlta ??
    evolucaoAtiva[evolucaoAtiva.length - 1]?.quadroClinico ??
    evolucaoAtiva[evolucaoAtiva.length - 1]?.evolucao;
  const pendencias = detalhe.cobrancas.filter(
    (cobranca) => cobranca.status === "pendente" || cobranca.status === "atrasado",
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-4 text-primary" />
                Próximos agendamentos
              </CardTitle>
              <CardDescription>Consultas e procedimentos futuros</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/pacientes/${id}/historico`}>Ver histórico</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {proximos.length === 0 ? (
              <EmptyState
                title="Nenhum agendamento futuro"
                description="Use o botão Agendar no topo da página para marcar um novo atendimento."
                icon={CalendarClock}
              />
            ) : (
              <ul className="divide-y divide-border">
                {proximos.map((agendamento) => (
                  <li key={agendamento.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-24 shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {formatDate(agendamento.data)}
                      </p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {agendamento.horaInicio}–{agendamento.horaFim}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{agendamento.procedimentoNome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {agendamento.profissionalNome}
                        {agendamento.sala ? ` · ${agendamento.sala}` : ""}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(agendamento.valor)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agendamento.particular ? "Particular" : "Convênio"}
                      </p>
                    </div>
                    <StatusBadge domain="agendamento" status={agendamento.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {acompanhamentoAtivo && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse className="size-4 text-primary" />
                  Acompanhamento clínico
                </CardTitle>
                <CardDescription>
                  {acompanhamentoAtivo.titulo} · {acompanhamentoAtivo.profissionalNome}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/pacientes/${id}/prontuario`}>Ver evolução</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge domain="acompanhamento" status={acompanhamentoAtivo.status} />
                <span className="text-xs tabular-nums text-muted-foreground">
                  Desde {formatDate(acompanhamentoAtivo.inicioEm)}
                  {acompanhamentoAtivo.altaEm ? ` · alta em ${formatDate(acompanhamentoAtivo.altaEm)}` : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Como estava</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{acompanhamentoAtivo.quadroInicial}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {acompanhamentoAtivo.status === "alta" ? "Na alta" : "Como está agora"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {quadroAtual ?? "Aguardando o próximo registro de evolução."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                Últimas visitas
              </CardTitle>
              <CardDescription>Evoluções registradas no prontuário</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/pacientes/${id}/prontuario`}>Abrir prontuário</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {ultimasVisitas.length === 0 ? (
              <EmptyState
                title="Nenhum atendimento registrado"
                description="As evoluções clínicas aparecem aqui após o primeiro atendimento."
                icon={Stethoscope}
              />
            ) : (
              <ul className="divide-y divide-border">
                {ultimasVisitas.map((atendimento) => (
                  <li key={atendimento.id} className="px-5 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{atendimento.procedimentoRealizado}</p>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatDate(atendimento.data)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{atendimento.profissionalNome}</p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{atendimento.evolucao}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4 text-primary" />
              Resumo clínico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alergias</p>
              {paciente.alergias.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">Nenhuma alergia registrada.</p>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paciente.alergias.map((alergia) => (
                    <Badge key={alergia} tone="danger">
                      <AlertTriangle className="size-3" />
                      {alergia}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Condições preexistentes
              </p>
              {paciente.condicoesPreexistentes.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">Nenhuma condição registrada.</p>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paciente.condicoesPreexistentes.map((condicao) => (
                    <Badge key={condicao} tone="warning">
                      {condicao}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medicações em uso</p>
              {paciente.medicacoesEmUso.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">Nenhuma medicação em uso.</p>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paciente.medicacoesEmUso.map((medicacao) => (
                    <Badge key={medicacao} tone="neutral">
                      <Pill className="size-3" />
                      {medicacao}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              Situação financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Saldo devedor</span>
              <span
                className={
                  paciente.saldoDevedor > 0
                    ? "text-lg font-semibold tabular-nums text-danger"
                    : "text-lg font-semibold tabular-nums text-success"
                }
              >
                {formatCurrency(paciente.saldoDevedor)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Cobranças em aberto</span>
              <span className="text-sm font-medium tabular-nums">{pendencias.length}</span>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href={`/pacientes/${id}/financeiro`}>Ver extrato completo</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados cadastrais</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              {[
                { termo: "Nascimento", valor: formatDateLong(paciente.dataNascimento) },
                { termo: "Sexo", valor: sexoLabels[paciente.sexo] },
                {
                  termo: "Estado civil",
                  valor: paciente.estadoCivil ? estadoCivilLabels[paciente.estadoCivil] : "Não informado",
                },
                { termo: "Convênio", valor: nomeConvenio(paciente.convenioId, paciente.convenioNome) },
                {
                  termo: "Validade carteirinha",
                  valor: paciente.validadeCarteirinha ? formatDate(paciente.validadeCarteirinha) : "—",
                },
                {
                  termo: "Profissional preferido",
                  valor: paciente.profissionalPreferidoNome ?? "Sem preferência",
                },
                {
                  termo: "Responsável",
                  valor: paciente.responsavel
                    ? `${paciente.responsavel.nome} (${paciente.responsavel.parentesco})`
                    : "—",
                },
                { termo: "Cadastrado em", valor: formatDate(paciente.criadoEm) },
              ].map((item) => (
                <div key={item.termo} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">{item.termo}</dt>
                  <dd className="text-right font-medium text-foreground">{item.valor}</dd>
                </div>
              ))}
            </dl>

            {paciente.observacoes && (
              <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{paciente.observacoes}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
