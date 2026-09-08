import type { AgendamentoStatus, TipoAgendamento } from "@/types";
import { getStatusMeta } from "@/lib/status";

export const PIXELS_POR_MINUTO = 1.5;

export const classesBlocoStatus: Record<AgendamentoStatus, string> = {
  agendado: "border-info bg-info-bg text-info",
  confirmado: "border-success bg-success-bg text-success",
  check_in: "border-warning bg-warning-bg text-warning",
  em_atendimento: "border-info bg-info/15 text-info",
  atendido: "border-success/40 bg-success-bg/70 text-success",
  cancelado: "border-danger/40 bg-danger-bg text-danger opacity-70",
  faltou: "border-danger bg-danger-bg text-danger",
};

export const tipoAgendamentoLabels: Record<TipoAgendamento, string> = {
  avaliacao: "Avaliação",
  atendimento: "Atendimento",
};

export function rotuloTipoAgendamento(tipo?: string | null): TipoAgendamento {
  return tipo === "avaliacao" ? "avaliacao" : "atendimento";
}

export function rotuloStatus(status: AgendamentoStatus) {
  return getStatusMeta("agendamento", status).label;
}

export const preferenciaPeriodoLabels = {
  manha: "Manhã",
  tarde: "Tarde",
  qualquer: "Qualquer horário",
} as const;
