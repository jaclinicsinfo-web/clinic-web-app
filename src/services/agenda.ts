import { endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";

import type { Agendamento, AgendamentoStatus } from "@/types";
import { agendamentos, bloqueiosAgenda, hoje, listaEspera } from "./mock/agenda";

export { hoje };

export const AGENDA_HORA_INICIO = 7;
export const AGENDA_HORA_FIM = 20;
export const AGENDA_SLOT_MINUTOS = 30;

export function listSlotsHorario(inicio = AGENDA_HORA_INICIO, fim = AGENDA_HORA_FIM) {
  const slots: string[] = [];
  for (let hora = inicio; hora < fim; hora += 1) {
    slots.push(`${String(hora).padStart(2, "0")}:00`);
    slots.push(`${String(hora).padStart(2, "0")}:30`);
  }
  return slots;
}

export function horaParaMinutos(hora: string) {
  const [horaNum, minutoNum] = hora.split(":").map(Number);
  return horaNum * 60 + minutoNum;
}

export function minutosParaHora(minutos: number) {
  const normalizado = ((minutos % (24 * 60)) + 24 * 60) % (24 * 60);
  const horaNum = Math.floor(normalizado / 60);
  const minutoNum = normalizado % 60;
  return `${String(horaNum).padStart(2, "0")}:${String(minutoNum).padStart(2, "0")}`;
}

export function somarMinutos(hora: string, minutos: number) {
  return minutosParaHora(horaParaMinutos(hora) + minutos);
}

export function duracaoEmMinutos(inicio: string, fim: string) {
  return Math.max(horaParaMinutos(fim) - horaParaMinutos(inicio), 0);
}

export function getAgendamentoById(id: string) {
  return agendamentos.find((agendamento) => agendamento.id === id);
}

export function proximosStatus(status: AgendamentoStatus): AgendamentoStatus[] {
  const fluxo: Record<AgendamentoStatus, AgendamentoStatus[]> = {
    agendado: ["confirmado", "cancelado"],
    confirmado: ["check_in", "cancelado", "faltou"],
    check_in: ["em_atendimento", "cancelado", "faltou"],
    em_atendimento: ["atendido"],
    atendido: [],
    cancelado: [],
    faltou: [],
  };
  return fluxo[status];
}

export function listAgendamentos(): Agendamento[] {
  return agendamentos;
}

export function getAgendamentosDoDia(data: Date) {
  const chave = format(data, "yyyy-MM-dd");
  return agendamentos
    .filter((agendamento) => agendamento.data === chave)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
}

export function getAgendamentosDaSemana(referencia: Date) {
  const inicio = startOfWeek(referencia, { weekStartsOn: 1 });
  const fim = endOfWeek(referencia, { weekStartsOn: 1 });

  return agendamentos
    .filter((agendamento) => {
      const data = parseISO(agendamento.data);
      return data >= inicio && data <= fim;
    })
    .sort((a, b) => `${a.data}${a.horaInicio}`.localeCompare(`${b.data}${b.horaInicio}`));
}

export function getAgendamentosDoMes(referencia: Date) {
  return agendamentos.filter((agendamento) => {
    const data = parseISO(agendamento.data);
    return data.getMonth() === referencia.getMonth() && data.getFullYear() === referencia.getFullYear();
  });
}

export function getBloqueios() {
  return bloqueiosAgenda;
}

export function getBloqueiosDoDia(data: Date) {
  const chave = format(data, "yyyy-MM-dd");
  return bloqueiosAgenda.filter((bloqueio) => bloqueio.data === chave);
}

export function getListaEspera() {
  return listaEspera;
}

export function getResumoDoDia(data: Date = hoje) {
  const doDia = getAgendamentosDoDia(data);

  const contarPorStatus = (status: AgendamentoStatus) =>
    doDia.filter((agendamento) => agendamento.status === status).length;

  return {
    total: doDia.length,
    confirmados: contarPorStatus("confirmado"),
    agendados: contarPorStatus("agendado"),
    emAtendimento: contarPorStatus("em_atendimento") + contarPorStatus("check_in"),
    atendidos: contarPorStatus("atendido"),
    cancelados: contarPorStatus("cancelado"),
    faltas: contarPorStatus("faltou"),
    faturamentoPrevisto: doDia
      .filter((agendamento) => agendamento.status !== "cancelado" && agendamento.status !== "faltou")
      .reduce((total, agendamento) => total + agendamento.valor, 0),
  };
}

export function getProximosAtendimentos(limite = 6) {
  const agora = format(new Date(), "HH:mm");

  return getAgendamentosDoDia(hoje)
    .filter(
      (agendamento) =>
        agendamento.horaInicio >= agora && agendamento.status !== "cancelado" && agendamento.status !== "atendido",
    )
    .slice(0, limite);
}

export function getFunilAgendamentos(referencia: Date = hoje) {
  const doMes = getAgendamentosDoMes(referencia);
  const total = doMes.length;

  const contar = (...status: AgendamentoStatus[]) =>
    doMes.filter((agendamento) => status.includes(agendamento.status)).length;

  return [
    { etapa: "Agendado", quantidade: total },
    {
      etapa: "Confirmado",
      quantidade: contar("confirmado", "check_in", "em_atendimento", "atendido"),
    },
    { etapa: "Atendido", quantidade: contar("atendido") },
    { etapa: "Faltou/Cancelado", quantidade: contar("faltou", "cancelado") },
  ];
}

export function getTaxaOcupacao(referencia: Date = hoje) {
  const doMes = getAgendamentosDoMes(referencia).filter((agendamento) => agendamento.status !== "cancelado");
  // Capacidade estimada: 6 profissionais ativos × 12 slots/dia × 22 dias úteis.
  const capacidade = 6 * 12 * 22;
  return Math.min((doMes.length / capacidade) * 100, 100);
}

export function getTaxaFaltas(referencia: Date = hoje) {
  const doMes = getAgendamentosDoMes(referencia);
  if (doMes.length === 0) return 0;
  const faltas = doMes.filter((agendamento) => agendamento.status === "faltou").length;
  return (faltas / doMes.length) * 100;
}

export function isHoje(data: string) {
  return isSameDay(parseISO(data), hoje);
}
