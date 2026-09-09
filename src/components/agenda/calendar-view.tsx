"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Lock } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatISODate, parseLocalDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  AGENDA_HORA_FIM,
  AGENDA_HORA_INICIO,
  duracaoEmMinutos,
  horaParaMinutos,
  listSlotsHorario,
} from "@/services/agenda";
import type { Agendamento, BloqueioAgenda, Profissional } from "@/types";

import { PIXELS_POR_MINUTO, classesBlocoStatus } from "./agenda-utils";

export type VisaoAgenda = "dia" | "semana" | "mes";

export interface SlotSelecionado {
  data: string;
  horaInicio: string;
  profissionalId?: string;
}

interface CalendarViewProps {
  visao: VisaoAgenda;
  dataIso: string;
  agendamentos: Agendamento[];
  bloqueios: BloqueioAgenda[];
  profissionais: Profissional[];
  onSelectAgendamento: (agendamento: Agendamento) => void;
  onSelectSlot?: (slot: SlotSelecionado) => void;
  onReagendar?: (agendamentoId: string, slot: SlotSelecionado) => void;
  onSelectDia: (dataIso: string) => void;
}

const slots = listSlotsHorario();
const alturaTotal = (AGENDA_HORA_FIM - AGENDA_HORA_INICIO) * 60 * PIXELS_POR_MINUTO;

function posicaoTopo(hora: string) {
  return (horaParaMinutos(hora) - AGENDA_HORA_INICIO * 60) * PIXELS_POR_MINUTO;
}

export function CalendarView(props: CalendarViewProps) {
  if (props.visao === "semana") return <VisaoSemana {...props} />;
  if (props.visao === "mes") return <VisaoMes {...props} />;
  return <VisaoDia {...props} />;
}

function VisaoDia({
  dataIso,
  agendamentos,
  bloqueios,
  profissionais,
  onSelectAgendamento,
  onSelectSlot,
  onReagendar,
}: CalendarViewProps) {
  if (profissionais.length === 0) {
    return (
      <EmptyState
        title="Nenhum profissional no filtro"
        description="Ajuste o filtro de profissional para ver a grade do dia."
      />
    );
  }

  const colunas = `64px repeat(${profissionais.length}, minmax(176px, 1fr))`;

  return (
    <div className="overflow-auto rounded-xl border border-border bg-card">
      <div style={{ minWidth: 64 + profissionais.length * 176 }}>
        <div
          className="sticky top-0 z-20 grid border-b border-border bg-card"
          style={{ gridTemplateColumns: colunas }}
        >
          <div className="border-r border-border" />
          {profissionais.map((profissional) => {
            const quantidade = agendamentos.filter(
              (agendamento) => agendamento.profissionalId === profissional.id,
            ).length;
            return (
              <div key={profissional.id} className="border-r border-border px-3 py-2 last:border-r-0">
                <p className="truncate text-sm font-semibold text-foreground">{profissional.nome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {profissional.especialidades[0]}
                  {quantidade > 0 ? ` · ${quantidade}` : ""}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns: colunas, height: alturaTotal }}>
          <div className="relative border-r border-border">
            {slots.map((slot) => (
              <div
                key={slot}
                className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground"
                style={{ top: posicaoTopo(slot) }}
              >
                {slot}
              </div>
            ))}
          </div>

          {profissionais.map((profissional) => (
            <ColunaProfissional
              key={profissional.id}
              dataIso={dataIso}
              profissional={profissional}
              agendamentos={agendamentos.filter((item) => item.profissionalId === profissional.id)}
              bloqueios={bloqueios.filter((item) => item.profissionalId === profissional.id && item.data === dataIso)}
              onSelectAgendamento={onSelectAgendamento}
              onSelectSlot={onSelectSlot}
              onReagendar={onReagendar}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ColunaProfissional({
  dataIso,
  profissional,
  agendamentos,
  bloqueios,
  onSelectAgendamento,
  onSelectSlot,
  onReagendar,
}: {
  dataIso: string;
  profissional: Profissional;
  agendamentos: Agendamento[];
  bloqueios: BloqueioAgenda[];
  onSelectAgendamento: (agendamento: Agendamento) => void;
  onSelectSlot?: (slot: SlotSelecionado) => void;
  onReagendar?: (agendamentoId: string, slot: SlotSelecionado) => void;
}) {
  function handleDrop(event: React.DragEvent, horaInicio: string) {
    event.preventDefault();
    if (!onReagendar) return;
    const id = event.dataTransfer.getData("text/agendamento-id");
    if (!id) return;
    onReagendar(id, { data: dataIso, horaInicio, profissionalId: profissional.id });
  }

  return (
    <div className="relative border-r border-border last:border-r-0">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          aria-label={`Horário ${slot} com ${profissional.nome}`}
          className={cn(
            "absolute inset-x-0 border-t border-border/70",
            onSelectSlot && "hover:bg-primary-subtle/60",
          )}
          style={{ top: posicaoTopo(slot), height: 30 * PIXELS_POR_MINUTO }}
          onClick={() => onSelectSlot?.({ data: dataIso, horaInicio: slot, profissionalId: profissional.id })}
          onDragOver={(event) => {
            if (!onReagendar) return;
            event.preventDefault();
          }}
          onDrop={(event) => handleDrop(event, slot)}
        />
      ))}

      {bloqueios.map((bloqueio) => (
        <div
          key={bloqueio.id}
          className="pointer-events-none absolute inset-x-1 z-10 overflow-hidden rounded-md border border-dashed border-neutral/40 bg-neutral-bg px-2 py-1"
          style={{
            top: posicaoTopo(bloqueio.horaInicio) + 2,
            height: Math.max(duracaoEmMinutos(bloqueio.horaInicio, bloqueio.horaFim) * PIXELS_POR_MINUTO - 4, 20),
          }}
        >
          <p className="flex items-center gap-1 text-[11px] font-medium text-neutral">
            <Lock className="size-3" />
            {bloqueio.motivo}
          </p>
          <p className="text-[10px] tabular-nums text-muted-foreground">
            {bloqueio.horaInicio} – {bloqueio.horaFim}
          </p>
        </div>
      ))}

      {agendamentos.map((agendamento) => {
        const altura = Math.max(
          duracaoEmMinutos(agendamento.horaInicio, agendamento.horaFim) * PIXELS_POR_MINUTO - 4,
          28,
        );
        return (
          <button
            key={agendamento.id}
            type="button"
            draggable={Boolean(onReagendar)}
            onDragStart={(event) => {
              if (!onReagendar) return;
              event.dataTransfer.setData("text/agendamento-id", agendamento.id);
              event.dataTransfer.effectAllowed = "move";
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectAgendamento(agendamento);
            }}
            className={cn(
              "absolute inset-x-1 z-20 overflow-hidden rounded-md border px-2 py-1 text-left shadow-sm",
              classesBlocoStatus[agendamento.status],
            )}
            style={{ top: posicaoTopo(agendamento.horaInicio) + 2, height: altura }}
          >
            <p className="truncate text-[11px] font-semibold tabular-nums">
              {agendamento.horaInicio} {agendamento.pacienteNome}
            </p>
            {altura > 40 && (
              <p className="truncate text-[10px] opacity-80">
                {agendamento.tipo === "avaliacao" ? "Avaliação" : agendamento.procedimentoNome}
              </p>
            )}
            {altura > 56 && (
              <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-80">
                {agendamento.lembreteEnviado && <Bell className="size-3" />}
                {agendamento.sala}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function VisaoSemana({
  dataIso,
  agendamentos,
  onSelectAgendamento,
  onSelectSlot,
  onSelectDia,
}: CalendarViewProps) {
  const referencia = parseLocalDate(dataIso);
  const inicio = startOfWeek(referencia, { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicio, end: endOfWeek(referencia, { weekStartsOn: 1 }) });

  return (
    <div className="overflow-auto rounded-xl border border-border bg-card">
      <div className="grid min-w-[840px] grid-cols-7">
        {dias.map((dia) => {
          const iso = formatISODate(dia);
          const doDia = agendamentos
            .filter((agendamento) => agendamento.data === iso)
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
          const hoje = isSameDay(dia, new Date());

          return (
            <div key={iso} className="flex min-h-[420px] flex-col border-r border-border last:border-r-0">
              <button
                type="button"
                onClick={() => onSelectDia(iso)}
                className={cn(
                  "sticky top-0 z-10 border-b border-border bg-card px-3 py-2 text-left hover:bg-muted/60",
                  hoje && "bg-primary-subtle",
                )}
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {format(dia, "EEE", { locale: ptBR })}
                </p>
                <p className={cn("text-lg font-semibold tabular-nums", hoje && "text-primary")}>
                  {format(dia, "d")}
                </p>
              </button>

              <div className="flex flex-1 flex-col gap-1.5 p-2">
                {doDia.length === 0 ? (
                  onSelectSlot ? (
                  <button
                    type="button"
                    className="rounded-md border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground hover:border-primary hover:text-primary"
                    onClick={() => onSelectSlot({ data: iso, horaInicio: "09:00" })}
                  >
                    Encaixar horário
                  </button>
                  ) : null
                ) : (
                  doDia.map((agendamento) => (
                    <button
                      key={agendamento.id}
                      type="button"
                      onClick={() => onSelectAgendamento(agendamento)}
                      className={cn(
                        "rounded-md border px-2 py-1.5 text-left",
                        classesBlocoStatus[agendamento.status],
                      )}
                    >
                      <p className="text-[11px] font-semibold tabular-nums">{agendamento.horaInicio}</p>
                      <p className="truncate text-xs font-medium">{agendamento.pacienteNome}</p>
                      <p className="truncate text-[10px] opacity-80">{agendamento.profissionalNome}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VisaoMes({ dataIso, agendamentos, onSelectDia }: CalendarViewProps) {
  const referencia = parseLocalDate(dataIso);
  const inicio = startOfWeek(startOfMonth(referencia), { weekStartsOn: 1 });
  const fim = endOfWeek(endOfMonth(referencia), { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicio, end: fim });
  const hoje = new Date();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia) => (
          <div key={dia} className="px-3 py-2 text-xs font-medium text-muted-foreground">
            {dia}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((dia) => {
          const iso = formatISODate(dia);
          const doDia = agendamentos.filter((agendamento) => agendamento.data === iso);
          const foraDoMes = !isSameMonth(dia, referencia);
          const ehHoje = isSameDay(dia, hoje);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDia(iso)}
              className={cn(
                "min-h-[112px] border-b border-r border-border p-2 text-left last:border-r-0 hover:bg-muted/50",
                foraDoMes && "bg-muted/30 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                  ehHoje && "bg-primary text-primary-foreground",
                )}
              >
                {format(dia, "d")}
              </span>
              <ul className="mt-1 space-y-0.5">
                {doDia.slice(0, 3).map((agendamento) => (
                  <li
                    key={agendamento.id}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                      classesBlocoStatus[agendamento.status],
                    )}
                  >
                    {agendamento.horaInicio} {agendamento.pacienteNome.split(" ")[0]}
                  </li>
                ))}
                {doDia.length > 3 && (
                  <li className="px-1 text-[10px] text-muted-foreground">+{doDia.length - 3} atendimentos</li>
                )}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function deslocarPeriodo(dataIso: string, visao: VisaoAgenda, direcao: -1 | 1) {
  const data = parseLocalDate(dataIso);
  if (visao === "dia") return formatISODate(addDays(data, direcao));
  if (visao === "semana") return formatISODate(addDays(data, direcao * 7));
  return formatISODate(addMonths(data, direcao));
}
