"use client";

import * as React from "react";
import {
  Activity,
  ArrowRight,
  CircleCheck,
  ClipboardList,
  FileText,
  Paperclip,
  Plus,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline, type TimelineItem } from "@/components/shared/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatISODate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AcompanhamentoClinico,
  Atendimento,
  RespostaTratamento,
  TipoRegistroClinico,
} from "@/types";

interface ProntuarioViewProps {
  acompanhamentos: AcompanhamentoClinico[];
  atendimentos: Atendimento[];
  procedimentos: { id: string; nome: string }[];
  profissionais: { id: string; nome: string }[];
  pacienteNome: string;
}

const iconeRegistro = {
  avaliacao_inicial: ClipboardList,
  evolucao: Stethoscope,
  retorno: RotateCcw,
  alta: CircleCheck,
} as const;

const tomTimeline = {
  avaliacao_inicial: "primary",
  evolucao: "primary",
  retorno: "warning",
  alta: "success",
} as const;

export function ProntuarioView({
  acompanhamentos: acompanhamentosIniciais,
  atendimentos: atendimentosIniciais,
  procedimentos,
  profissionais,
  pacienteNome,
}: ProntuarioViewProps) {
  const [acompanhamentos, setAcompanhamentos] = React.useState(acompanhamentosIniciais);
  const [atendimentos, setAtendimentos] = React.useState(atendimentosIniciais);
  const [selecionadoId, setSelecionadoId] = React.useState(acompanhamentosIniciais[0]?.id);
  const [aberto, setAberto] = React.useState(false);

  const selecionado = acompanhamentos.find((item) => item.id === selecionadoId) ?? acompanhamentos[0];
  const evolucoes = React.useMemo(() => {
    if (!selecionado) {
      return [...atendimentos].sort((a, b) => a.data.localeCompare(b.data));
    }
    return atendimentos
      .filter((item) => item.acompanhamentoId === selecionado.id)
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [atendimentos, selecionado]);

  const outros = React.useMemo(
    () =>
      atendimentos
        .filter((item) => !item.acompanhamentoId)
        .sort((a, b) => b.data.localeCompare(a.data)),
    [atendimentos],
  );

  const primeira = evolucoes[0];
  const ultima = evolucoes[evolucoes.length - 1];
  const escalas = evolucoes.filter((item) => typeof item.escalaDor === "number");

  function registrar(registro: Atendimento, alta?: { resumo: string }) {
    setAtendimentos((atual) => [...atual, registro]);
    if (alta && selecionado) {
      setAcompanhamentos((atual) =>
        atual.map((item) =>
          item.id === selecionado.id
            ? { ...item, status: "alta", altaEm: registro.data, resumoAlta: alta.resumo }
            : item,
        ),
      );
    }
    toast.success(registro.tipoRegistro === "alta" ? "Alta registrada" : "Evolução registrada", {
      description: pacienteNome,
    });
  }

  return (
    <div className="space-y-4">
      {acompanhamentos.length > 0 && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {acompanhamentos.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelecionadoId(item.id)}
              className={cn(
                "rounded-xl border bg-card p-4 text-left shadow-sm transition-colors",
                selecionado?.id === item.id ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
                <StatusBadge domain="acompanhamento" status={item.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.especialidade} · {item.profissionalNome}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.queixaInicial}</p>
              <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                Desde {formatDate(item.inicioEm)}
                {item.altaEm ? ` · alta em ${formatDate(item.altaEm)}` : ""}
              </p>
            </button>
          ))}
        </div>
      )}

      {selecionado ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Evolução clínica</CardTitle>
              <CardDescription>
                Da avaliação inicial até {selecionado.status === "alta" ? "a alta" : "o momento atual"} —{" "}
                {evolucoes.length} {evolucoes.length === 1 ? "registro" : "registros"}
              </CardDescription>
            </div>
            <Button onClick={() => setAberto(true)} disabled={selecionado.status === "alta"}>
              <Plus />
              {selecionado.status === "alta" ? "Acompanhamento encerrado" : "Nova evolução"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-info-bg px-2.5 py-1 text-info">
                <ClipboardList className="size-3.5" />
                Avaliação inicial
              </li>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <li className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-1 text-primary">
                <Stethoscope className="size-3.5" />
                {Math.max(evolucoes.filter((item) => item.tipoRegistro !== "avaliacao_inicial" && item.tipoRegistro !== "alta").length, 0)}{" "}
                evoluções
              </li>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <li
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                  selecionado.status === "alta" ? "bg-success-bg text-success" : "bg-muted text-muted-foreground",
                )}
              >
                <CircleCheck className="size-3.5" />
                Alta
              </li>
            </ol>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Como estava</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selecionado.queixaInicial}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{selecionado.quadroInicial}</p>
                {primeira && (
                  <p className="mt-2 text-xs tabular-nums text-muted-foreground">{formatDate(primeira.data)}</p>
                )}
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {selecionado.status === "alta" ? "Situação na alta" : "Como está agora"}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {selecionado.resumoAlta ?? ultima?.quadroClinico ?? ultima?.evolucao ?? "Aguardando o primeiro registro."}
                </p>
                {ultima?.respostaAoTratamento && (
                  <div className="mt-2">
                    <StatusBadge domain="respostaTratamento" status={ultima.respostaAoTratamento} />
                  </div>
                )}
                {(ultima || selecionado.altaEm) && (
                  <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                    {formatDate(selecionado.altaEm ?? ultima?.data ?? selecionado.inicioEm)}
                  </p>
                )}
              </div>
            </div>

            {escalas.length > 1 && (
              <div className="rounded-lg border border-border px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dor (EVA 0–10)</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  {escalas.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <span className="tabular-nums font-semibold text-foreground">
                        {item.escalaDor}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">{formatDate(item.data)}</span>
                      </span>
                      {index < escalas.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            )}

            {selecionado.objetivo && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Objetivo: </span>
                {selecionado.objetivo}
              </p>
            )}

            {evolucoes.length === 0 ? (
              <EmptyState
                title="Ainda sem registros neste acompanhamento"
                description="Registre a avaliação inicial para começar a linha da evolução."
                icon={FileText}
              />
            ) : (
              <Timeline
                items={evolucoes.map((atendimento) => paraItemTimeline(atendimento))}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Linha do tempo clínica</CardTitle>
              <CardDescription>Ainda não há um acompanhamento formal. Os atendimentos avulsos aparecem abaixo.</CardDescription>
            </div>
            <Button onClick={() => setAberto(true)}>
              <Plus />
              Nova evolução
            </Button>
          </CardHeader>
          <CardContent>
            {atendimentos.length === 0 ? (
              <EmptyState
                title="Prontuário sem registros"
                description="Registre a primeira avaliação para acompanhar a evolução até a alta."
                icon={FileText}
              />
            ) : (
              <Timeline
                items={[...atendimentos]
                  .sort((a, b) => a.data.localeCompare(b.data))
                  .map((atendimento) => paraItemTimeline(atendimento))}
              />
            )}
          </CardContent>
        </Card>
      )}

      {selecionado && outros.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-muted-foreground" />
              Outros atendimentos
            </CardTitle>
            <CardDescription>Registros da agenda que ainda não estão vinculados a este acompanhamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline items={outros.slice(0, 8).map((atendimento) => paraItemTimeline(atendimento))} />
          </CardContent>
        </Card>
      )}

      <EvolucaoDialog
        open={aberto}
        onOpenChange={setAberto}
        pacienteNome={pacienteNome}
        acompanhamento={selecionado}
        procedimentos={procedimentos}
        profissionais={profissionais}
        onSave={registrar}
      />
    </div>
  );
}

function paraItemTimeline(atendimento: Atendimento): TimelineItem {
  return {
    id: atendimento.id,
    title: atendimento.procedimentoRealizado,
    meta: formatDate(atendimento.data),
    icon: iconeRegistro[atendimento.tipoRegistro],
    tone: tomTimeline[atendimento.tipoRegistro],
    description: (
      <>
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-xs font-medium text-foreground">{atendimento.profissionalNome}</p>
          <StatusBadge domain="registroClinico" status={atendimento.tipoRegistro} />
          {atendimento.respostaAoTratamento && (
            <StatusBadge domain="respostaTratamento" status={atendimento.respostaAoTratamento} />
          )}
          {typeof atendimento.escalaDor === "number" && (
            <Badge tone="outline">Dor {atendimento.escalaDor}/10</Badge>
          )}
        </div>
        {atendimento.queixaPrincipal && (
          <p className="mt-1.5 text-xs font-medium text-foreground">{atendimento.queixaPrincipal}</p>
        )}
        {atendimento.quadroClinico && (
          <p className="mt-1 leading-relaxed">{atendimento.quadroClinico}</p>
        )}
        <p className={cn("leading-relaxed", atendimento.quadroClinico ? "mt-1.5" : "mt-1.5")}>
          {atendimento.evolucao}
        </p>
        {atendimento.conduta && (
          <p className="mt-1.5 text-xs">
            <span className="font-medium text-foreground">Conduta: </span>
            {atendimento.conduta}
          </p>
        )}
        {atendimento.proximoRetornoSugerido && atendimento.tipoRegistro !== "alta" && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Retorno sugerido: {formatDate(atendimento.proximoRetornoSugerido)}
          </p>
        )}
      </>
    ),
    footer:
      atendimento.anexos.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {atendimento.anexos.map((anexo) => (
            <li key={anexo.id}>
              <a
                href={anexo.url}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Paperclip className="size-3" />
                {anexo.nome}
                <span className="text-muted-foreground">{formatNumber(anexo.tamanhoKb)} KB</span>
              </a>
            </li>
          ))}
        </ul>
      ) : undefined,
  };
}

function EvolucaoDialog({
  open,
  onOpenChange,
  pacienteNome,
  acompanhamento,
  procedimentos,
  profissionais,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteNome: string;
  acompanhamento?: AcompanhamentoClinico;
  procedimentos: { id: string; nome: string }[];
  profissionais: { id: string; nome: string }[];
  onSave: (registro: Atendimento, alta?: { resumo: string }) => void;
}) {
  const [tipo, setTipo] = React.useState<TipoRegistroClinico>(
    acompanhamento && !acompanhamento ? "avaliacao_inicial" : "evolucao",
  );
  const [procedimento, setProcedimento] = React.useState(procedimentos[0]?.id ?? "");
  const [profissional, setProfissional] = React.useState(acompanhamento?.profissionalId ?? profissionais[0]?.id ?? "");
  const [queixa, setQueixa] = React.useState("");
  const [quadro, setQuadro] = React.useState("");
  const [evolucao, setEvolucao] = React.useState("");
  const [conduta, setConduta] = React.useState("");
  const [resposta, setResposta] = React.useState<RespostaTratamento>("melhorou");
  const [dor, setDor] = React.useState("");
  const [retorno, setRetorno] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const inicial = acompanhamento ? "evolucao" : "avaliacao_inicial";
    setTipo(inicial);
    setProfissional(acompanhamento?.profissionalId ?? profissionais[0]?.id ?? "");
    setQueixa("");
    setQuadro("");
    setEvolucao("");
    setConduta("");
    setResposta(inicial === "avaliacao_inicial" ? "estavel" : "melhorou");
    setDor("");
    setRetorno("");
  }, [open, acompanhamento, profissionais]);

  async function salvar() {
    const procedimentoNome = procedimentos.find((item) => item.id === procedimento)?.nome ?? "Atendimento";
    const profissionalNome = profissionais.find((item) => item.id === profissional)?.nome ?? "";
    const hojeIso = formatISODate(new Date());
    const registro: Atendimento = {
      id: `at-local-${Date.now()}`,
      agendamentoId: `ag-local-${Date.now()}`,
      pacienteId: acompanhamento?.pacienteId ?? "",
      profissionalId: profissional,
      profissionalNome,
      data: hojeIso,
      procedimentoRealizado: procedimentoNome,
      evolucao: evolucao.trim(),
      anexos: [],
      proximoRetornoSugerido: tipo === "alta" ? undefined : retorno || undefined,
      criadoEm: new Date().toISOString(),
      acompanhamentoId: acompanhamento?.id,
      tipoRegistro: tipo,
      queixaPrincipal: queixa.trim() || undefined,
      quadroClinico: quadro.trim() || undefined,
      conduta: conduta.trim() || undefined,
      respostaAoTratamento: tipo === "alta" ? "resolvido" : resposta,
      escalaDor: dor === "" ? undefined : Number(dor),
    };

    setSalvando(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    onSave(registro, tipo === "alta" ? { resumo: quadro.trim() || evolucao.trim() } : undefined);
    setSalvando(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{tipo === "alta" ? "Registrar alta" : "Registrar evolução clínica"}</DialogTitle>
          <DialogDescription>
            {pacienteNome}
            {acompanhamento ? ` · ${acompanhamento.titulo}` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <FormField label="Tipo de registro" required>
            <Select value={tipo} onValueChange={(valor) => setTipo(valor as TipoRegistroClinico)}>
              <SelectTrigger aria-label="Tipo de registro">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avaliacao_inicial">Avaliação inicial</SelectItem>
                <SelectItem value="evolucao">Evolução</SelectItem>
                <SelectItem value="retorno">Retorno</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Procedimento realizado" required>
              <Select value={procedimento} onValueChange={setProcedimento}>
                <SelectTrigger aria-label="Procedimento realizado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {procedimentos.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Profissional responsável" required>
              <Select value={profissional} onValueChange={setProfissional}>
                <SelectTrigger aria-label="Profissional responsável">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Queixa / motivo" htmlFor="queixa" hint="O que o paciente relata neste encontro.">
            <Input
              id="queixa"
              value={queixa}
              onChange={(event) => setQueixa(event.target.value)}
              placeholder="Ex.: dor no joelho, cefaleia, retorno de glicemia..."
            />
          </FormField>

          <FormField
            label={tipo === "alta" ? "Situação na alta" : "Como o paciente está hoje"}
            htmlFor="quadro"
            required
            hint="Descreva o quadro atual em relação à avaliação inicial."
          >
            <Textarea
              id="quadro"
              rows={3}
              value={quadro}
              onChange={(event) => setQuadro(event.target.value)}
              placeholder={
                tipo === "alta"
                  ? "Condição no momento da alta, orientações e critérios de encerramento..."
                  : "Sinais, sintomas, exames e comparação com a consulta anterior..."
              }
            />
          </FormField>

          <FormField label="Evolução / observações" htmlFor="evolucao" required>
            <Textarea
              id="evolucao"
              rows={4}
              value={evolucao}
              onChange={(event) => setEvolucao(event.target.value)}
              placeholder="Relato livre do atendimento, exame físico e impressão clínica."
            />
          </FormField>

          <FormField label="Conduta" htmlFor="conduta">
            <Textarea
              id="conduta"
              rows={2}
              value={conduta}
              onChange={(event) => setConduta(event.target.value)}
              placeholder="Medicação, encaminhamento, orientações, próxima sessão..."
            />
          </FormField>

          {tipo !== "alta" && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Resposta ao tratamento</p>
              <RadioGroup
                value={resposta}
                onValueChange={(valor) => setResposta(valor as RespostaTratamento)}
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {(
                  [
                    ["melhorou", "Melhorou"],
                    ["estavel", "Estável"],
                    ["piorou", "Piorou"],
                    ["resolvido", "Resolvido"],
                  ] as const
                ).map(([valor, label]) => (
                  <Label
                    key={valor}
                    htmlFor={`resp-${valor}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <RadioGroupItem id={`resp-${valor}`} value={valor} />
                    {label}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Dor (EVA 0–10)" htmlFor="dor" hint="Opcional. Útil em reabilitação.">
              <Input
                id="dor"
                type="number"
                min={0}
                max={10}
                value={dor}
                onChange={(event) => setDor(event.target.value)}
              />
            </FormField>
            {tipo !== "alta" && (
              <FormField label="Próximo retorno sugerido" htmlFor="retorno">
                <Input id="retorno" type="date" value={retorno} onChange={(event) => setRetorno(event.target.value)} />
              </FormField>
            )}
            <FormField label="Anexos" hint="Exames, laudos e imagens do atendimento.">
              <Input type="file" multiple />
            </FormField>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            onClick={salvar}
            loading={salvando}
            disabled={evolucao.trim().length < 10 || quadro.trim().length < 8}
          >
            {tipo === "alta" ? "Confirmar alta" : "Salvar evolução"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
