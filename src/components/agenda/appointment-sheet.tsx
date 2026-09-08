"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PatientCard, type PatientCardPaciente } from "@/components/shared/patient-card";
import { FormField, FormSection } from "@/components/shared/form-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getStatusMeta } from "@/lib/status";
import { duracaoEmMinutos, proximosStatus, somarMinutos } from "@/services/agenda";
import type { Agendamento, AgendamentoStatus, Procedimento, Profissional, TipoAgendamento } from "@/types";
import type { SlotSelecionado } from "./calendar-view";
import { tipoAgendamentoLabels, rotuloTipoAgendamento } from "./agenda-utils";

const schema = z
  .object({
    pacienteId: z.string().min(1, "Selecione o paciente."),
    profissionalId: z.string().min(1, "Selecione o profissional."),
    procedimentoId: z.string().min(1, "Selecione o procedimento."),
    data: z.string().min(1, "Informe a data."),
    horaInicio: z.string().min(1, "Informe o horário."),
    horaFim: z.string().min(1, "Informe o término."),
    sala: z.string(),
    particular: z.boolean(),
    convenioId: z.string().nullable(),
    tipo: z.enum(["avaliacao", "atendimento"]),
    observacoes: z.string(),
    status: z.enum([
      "agendado",
      "confirmado",
      "check_in",
      "em_atendimento",
      "atendido",
      "cancelado",
      "faltou",
    ]),
  });

type FormValues = z.infer<typeof schema>;

export interface AgendamentoDraft {
  id?: string;
  pacienteId: string;
  pacienteNome: string;
  profissionalId: string;
  profissionalNome: string;
  procedimentoId: string;
  procedimentoNome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  sala?: string;
  convenioId: string | null;
  particular: boolean;
  tipo: TipoAgendamento;
  valor: number;
  status: AgendamentoStatus;
  observacoes?: string;
}

export interface PacienteAgenda extends PatientCardPaciente {
  convenioId: string | null;
}

interface AppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento?: Agendamento | null;
  slot?: SlotSelecionado | null;
  pacienteInicialId?: string;
  pacientes: PacienteAgenda[];
  profissionais: Profissional[];
  procedimentos: Procedimento[];
  convenios: { id: string; nome: string }[];
  salas: string[];
  ultimosPacientes?: PacienteAgenda[];
  ultimosPacientesPorProfissional?: Record<string, PacienteAgenda[]>;
  onSave: (draft: AgendamentoDraft) => void | Promise<void>;
  onChangeStatus?: (id: string, status: AgendamentoStatus) => void;
  onNovoPaciente?: (paciente: PacienteAgenda) => void;
}

export function AppointmentSheet({
  open,
  onOpenChange,
  agendamento,
  slot,
  pacienteInicialId,
  pacientes,
  profissionais,
  procedimentos,
  convenios,
  salas,
  ultimosPacientes = [],
  ultimosPacientesPorProfissional = {},
  onSave,
  onChangeStatus,
  onNovoPaciente,
}: AppointmentSheetProps) {
  const [busca, setBusca] = React.useState("");

  const edicao = Boolean(agendamento);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais(agendamento, slot, pacienteInicialId),
  });

  React.useEffect(() => {
    if (!open) {
      setBusca("");
      return;
    }
    reset(valoresIniciais(agendamento, slot, pacienteInicialId));
  }, [open, agendamento, slot, pacienteInicialId, reset]);

  const values = watch();
  const paciente = pacientes.find((item) => item.id === values.pacienteId);
  const profissional = profissionais.find((item) => item.id === values.profissionalId);
  const procedimento = procedimentos.find((item) => item.id === values.procedimentoId);

  const procedimentosHabilitados = React.useMemo(() => {
    if (!profissional) return procedimentos.filter((item) => item.status === "ativo");
    return procedimentos.filter(
      (item) => item.status === "ativo" && profissional.procedimentosHabilitados.includes(item.id),
    );
  }, [profissional, procedimentos]);

  const valorCalculado = React.useMemo(() => {
    if (!procedimento) return 0;
    if (values.particular || !values.convenioId) return procedimento.valorParticular;
    return procedimento.valoresPorConvenio.find((item) => item.convenioId === values.convenioId)?.valor
      ?? procedimento.valorParticular;
  }, [procedimento, values.particular, values.convenioId]);

  const pacientesFiltrados = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (termo) {
      return pacientes
        .filter((item) =>
          [item.nome, item.telefone, item.cpf ?? ""].some((campo) => campo.toLowerCase().includes(termo)),
        )
        .slice(0, 8);
    }
    if (values.profissionalId) {
      return ultimosPacientesPorProfissional[values.profissionalId] ?? [];
    }
    return ultimosPacientes.slice(0, 3);
  }, [busca, pacientes, ultimosPacientes, ultimosPacientesPorProfissional, values.profissionalId]);

  function selecionarPaciente(item: PacienteAgenda) {
    setValue("pacienteId", item.id, { shouldValidate: true });
    if (item.convenioId) {
      setValue("particular", false);
      setValue("convenioId", item.convenioId);
    } else {
      setValue("particular", true);
      setValue("convenioId", null);
    }
    const jaAtendido = Boolean(
      (values.profissionalId &&
        ultimosPacientesPorProfissional[values.profissionalId]?.some((paciente) => paciente.id === item.id)) ||
        ultimosPacientes.some((paciente) => paciente.id === item.id),
    );
    setValue("tipo", jaAtendido ? "atendimento" : "avaliacao");
    setBusca("");
  }

  function onProcedimentoChange(procedimentoId: string) {
    setValue("procedimentoId", procedimentoId, { shouldValidate: true });
    const escolhido = procedimentos.find((item) => item.id === procedimentoId);
    if (escolhido && values.horaInicio) {
      setValue("horaFim", somarMinutos(values.horaInicio, escolhido.duracaoPadraoMin));
    }
  }

  function onHoraInicioChange(horaInicio: string) {
    setValue("horaInicio", horaInicio, { shouldValidate: true });
    if (procedimento) {
      setValue("horaFim", somarMinutos(horaInicio, procedimento.duracaoPadraoMin));
    }
  }

  async function onSubmit(form: FormValues) {
    if (duracaoEmMinutos(form.horaInicio, form.horaFim) <= 0) {
      toast.error("O horário final deve ser posterior ao inicial.");
      return;
    }
    if (!paciente || !profissional || !procedimento) return;

    await onSave({
      id: agendamento?.id,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      profissionalId: profissional.id,
      profissionalNome: profissional.nome,
      procedimentoId: procedimento.id,
      procedimentoNome: procedimento.nome,
      data: form.data,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      sala: form.sala || undefined,
      convenioId: form.particular ? null : form.convenioId,
      particular: form.particular || !form.convenioId,
      tipo: form.tipo,
      valor: valorCalculado,
      status: form.status,
      observacoes: form.observacoes || undefined,
    });
  }

  const transicoes = agendamento ? proximosStatus(agendamento.status) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent width="max-w-lg">
        <SheetHeader>
          <SheetTitle>{edicao ? "Editar agendamento" : "Novo agendamento"}</SheetTitle>
          <SheetDescription>
            {edicao
              ? `${agendamento?.pacienteNome} · ${agendamento?.horaInicio} – ${agendamento?.horaFim}`
              : "Preencha os dados para encaixar o paciente na grade."}
          </SheetDescription>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSubmit)}>
          <SheetBody className="space-y-6">
            {agendamento && (
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge domain="agendamento" status={agendamento.status} />
                {agendamento.lembreteEnviado && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Bell className="size-3.5" />
                    Lembrete enviado
                  </span>
                )}
                {transicoes.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={status === "cancelado" || status === "faltou" ? "outline" : "subtle"}
                    onClick={() => onChangeStatus?.(agendamento.id, status)}
                  >
                    {getStatusMeta("agendamento", status).label}
                  </Button>
                ))}
              </div>
            )}

            <FormSection title="Paciente" description="Últimos 3 do profissional. Busque para encontrar outros." columns={1}>
              <FormField label="Profissional" error={errors.profissionalId?.message} required>
                <Select
                  value={values.profissionalId || undefined}
                  onValueChange={(valor) => setValue("profissionalId", valor, { shouldValidate: true })}
                >
                  <SelectTrigger aria-label="Profissional">
                    <SelectValue placeholder="Selecione" />
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

              {paciente ? (
                <div className="rounded-lg border border-border p-1">
                  <PatientCard
                    paciente={paciente}
                    convenioNome={
                      paciente.convenioId
                        ? convenios.find((item) => item.id === paciente.convenioId)?.nome
                        : "Particular"
                    }
                  />
                  <div className="px-2 pb-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setValue("pacienteId", "")}>
                      Trocar paciente
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={busca}
                      onChange={(event) => setBusca(event.target.value)}
                      placeholder="Buscar paciente..."
                      className="pl-9"
                      aria-invalid={Boolean(errors.pacienteId)}
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                    {pacientesFiltrados.map((item) => (
                      <PatientCard
                        key={item.id}
                        paciente={item}
                        convenioNome={
                          item.convenioId
                            ? convenios.find((convenio) => convenio.id === item.convenioId)?.nome
                            : "Particular"
                        }
                        compact
                        onClick={() => selecionarPaciente(item)}
                      />
                    ))}
                    {pacientesFiltrados.length === 0 && (
                      <p className="px-3 py-4 text-sm text-muted-foreground">
                        {busca.trim()
                          ? "Nenhum paciente encontrado."
                          : values.profissionalId
                            ? "Nenhum atendimento recente deste profissional. Busque pelo nome, CPF ou telefone."
                            : "Selecione o profissional para ver os últimos pacientes, ou busque pelo nome."}
                      </p>
                    )}
                  </div>
                  {errors.pacienteId && <p className="text-xs text-destructive">{errors.pacienteId.message}</p>}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onNovoPaciente?.({
                        id: "",
                        nome: "",
                        telefone: "",
                        convenioId: null,
                      })
                    }
                  >
                    <UserPlus />
                    Cadastrar novo
                  </Button>
                </div>
              )}
            </FormSection>

            <FormSection title="Atendimento">
              <FormField label="Tipo" error={errors.tipo?.message} required full>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    {
                      valor: "avaliacao" as const,
                      descricao: "Primeira vez ou consulta de avaliação",
                    },
                    {
                      valor: "atendimento" as const,
                      descricao: "Consulta, retorno ou procedimento",
                    },
                  ] as const).map((opcao) => {
                    const selecionado = values.tipo === opcao.valor;
                    return (
                      <button
                        key={opcao.valor}
                        type="button"
                        onClick={() => setValue("tipo", opcao.valor, { shouldValidate: true })}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-left transition-colors",
                          selecionado
                            ? "border-primary bg-primary-subtle"
                            : "border-border hover:bg-muted",
                        )}
                      >
                        <span className="block text-sm font-medium text-foreground">
                          {tipoAgendamentoLabels[opcao.valor]}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{opcao.descricao}</span>
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Procedimento" error={errors.procedimentoId?.message} required>
                <Select value={values.procedimentoId || undefined} onValueChange={onProcedimentoChange}>
                  <SelectTrigger aria-label="Procedimento">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedimentosHabilitados.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nome} · {formatMinutes(item.duracaoPadraoMin)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Data" htmlFor="data" error={errors.data?.message} required>
                <Input
                  id="data"
                  type="date"
                  value={values.data}
                  onChange={(event) => setValue("data", event.target.value, { shouldValidate: true })}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Início" htmlFor="horaInicio" error={errors.horaInicio?.message} required>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={values.horaInicio}
                    onChange={(event) => onHoraInicioChange(event.target.value)}
                  />
                </FormField>
                <FormField label="Término" htmlFor="horaFim" error={errors.horaFim?.message} required>
                  <Input
                    id="horaFim"
                    type="time"
                    value={values.horaFim}
                    onChange={(event) => setValue("horaFim", event.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Sala / consultório" error={errors.sala?.message}>
                <Select value={values.sala || undefined} onValueChange={(valor) => setValue("sala", valor)}>
                  <SelectTrigger aria-label="Sala">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((sala) => (
                      <SelectItem key={sala} value={sala}>
                        {sala}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Status inicial" error={errors.status?.message}>
                <Select
                  value={values.status}
                  onValueChange={(valor) => setValue("status", valor as AgendamentoStatus)}
                >
                  <SelectTrigger aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="check_in">Check-in</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormSection>

            <FormSection title="Convênio e valor" description="Opcional. Use só se o atendimento for pelo plano." columns={1}>
              <div className="flex items-start gap-3 rounded-lg border border-border px-4 py-3">
                <Switch
                  id="particular"
                  className="mt-0.5"
                  checked={values.particular}
                  onCheckedChange={(checked) => {
                    setValue("particular", checked, { shouldValidate: true });
                    if (checked) setValue("convenioId", null, { shouldValidate: true });
                  }}
                />
                <div>
                  <Label htmlFor="particular">Particular</Label>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Desmarque apenas se quiser informar um convênio.
                  </p>
                </div>
              </div>

              {!values.particular && (
                <FormField label="Convênio" error={errors.convenioId?.message}>
                  <Select
                    value={values.convenioId || undefined}
                    onValueChange={(valor) => setValue("convenioId", valor, { shouldValidate: true })}
                  >
                    <SelectTrigger aria-label="Convênio">
                      <SelectValue placeholder="Selecione o convênio" />
                    </SelectTrigger>
                    <SelectContent>
                      {convenios.map((convenio) => (
                        <SelectItem key={convenio.id} value={convenio.id}>
                          {convenio.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}

              <p className="text-sm text-muted-foreground">
                Valor previsto: <span className="font-semibold tabular-nums text-foreground">{formatCurrency(valorCalculado)}</span>
              </p>
            </FormSection>

            <FormSection title="Observações" columns={1}>
              <FormField label="Anotações da recepção" htmlFor="observacoes" full>
                <Textarea
                  id="observacoes"
                  rows={3}
                  value={values.observacoes}
                  onChange={(event) => setValue("observacoes", event.target.value)}
                  placeholder="Encaixe, autorização, preferência de horário..."
                />
              </FormField>
            </FormSection>
          </SheetBody>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {edicao ? "Salvar alterações" : "Confirmar agendamento"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function valoresIniciais(
  agendamento?: Agendamento | null,
  slot?: SlotSelecionado | null,
  pacienteInicialId?: string,
): FormValues {
  if (agendamento) {
    return {
      pacienteId: agendamento.pacienteId,
      profissionalId: agendamento.profissionalId,
      procedimentoId: agendamento.procedimentoId,
      data: agendamento.data,
      horaInicio: agendamento.horaInicio,
      horaFim: agendamento.horaFim,
      sala: agendamento.sala ?? "",
      particular: agendamento.particular,
      convenioId: agendamento.convenioId,
      tipo: rotuloTipoAgendamento(agendamento.tipo),
      observacoes: agendamento.observacoes ?? "",
      status: agendamento.status,
    };
  }

  return {
    pacienteId: pacienteInicialId ?? "",
    profissionalId: slot?.profissionalId ?? "",
    procedimentoId: "",
    data: slot?.data ?? "",
    horaInicio: slot?.horaInicio ?? "09:00",
    horaFim: slot?.horaInicio ? somarMinutos(slot.horaInicio, 30) : "09:30",
    sala: "",
    particular: true,
    convenioId: null,
    tipo: "atendimento",
    observacoes: "",
    status: "agendado",
  };
}
