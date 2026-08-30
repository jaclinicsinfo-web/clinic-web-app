import type { StatusTone } from "@/types";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
}

/**
 * Cores de status padronizadas (seção 3.2 da especificação):
 * verde = confirmado/pago/ativo · amarelo = pendente/aguardando
 * vermelho = cancelado/atrasado/inadimplente · azul = em andamento/agendado
 * cinza = inativo/arquivado
 */
export const statusMaps = {
  agendamento: {
    agendado: { label: "Agendado", tone: "info" },
    confirmado: { label: "Confirmado", tone: "success" },
    check_in: { label: "Check-in", tone: "warning" },
    em_atendimento: { label: "Em atendimento", tone: "info" },
    atendido: { label: "Atendido", tone: "success" },
    cancelado: { label: "Cancelado", tone: "danger" },
    faltou: { label: "Faltou", tone: "danger" },
  },
  paciente: {
    ativo: { label: "Ativo", tone: "success" },
    inativo: { label: "Inativo", tone: "neutral" },
    arquivado: { label: "Arquivado", tone: "neutral" },
  },
  profissional: {
    ativo: { label: "Ativo", tone: "success" },
    inativo: { label: "Inativo", tone: "neutral" },
  },
  cobranca: {
    pendente: { label: "Pendente", tone: "warning" },
    pago: { label: "Pago", tone: "success" },
    atrasado: { label: "Atrasado", tone: "danger" },
    parcelado: { label: "Parcelado", tone: "info" },
    cancelado: { label: "Cancelado", tone: "neutral" },
  },
  parcela: {
    pendente: { label: "Pendente", tone: "warning" },
    pago: { label: "Paga", tone: "success" },
    atrasado: { label: "Atrasada", tone: "danger" },
  },
  despesa: {
    a_pagar: { label: "A pagar", tone: "warning" },
    pago: { label: "Pago", tone: "success" },
    vencido: { label: "Vencido", tone: "danger" },
  },
  lote: {
    aberto: { label: "Aberto", tone: "neutral" },
    enviado: { label: "Enviado", tone: "info" },
    pago: { label: "Pago", tone: "success" },
    glosado: { label: "Glosado", tone: "danger" },
    parcial: { label: "Pago parcial", tone: "warning" },
  },
  comissao: {
    prevista: { label: "Prevista", tone: "warning" },
    aprovada: { label: "Aprovada", tone: "info" },
    paga: { label: "Paga", tone: "success" },
  },
  generico: {
    ativo: { label: "Ativo", tone: "success" },
    inativo: { label: "Inativo", tone: "neutral" },
  },
  acompanhamento: {
    em_andamento: { label: "Em acompanhamento", tone: "info" },
    alta: { label: "Alta", tone: "success" },
    abandonado: { label: "Abandonado", tone: "neutral" },
  },
  registroClinico: {
    avaliacao_inicial: { label: "Avaliação inicial", tone: "info" },
    evolucao: { label: "Evolução", tone: "info" },
    retorno: { label: "Retorno", tone: "warning" },
    alta: { label: "Alta", tone: "success" },
  },
  respostaTratamento: {
    melhorou: { label: "Melhorou", tone: "success" },
    estavel: { label: "Estável", tone: "warning" },
    piorou: { label: "Piorou", tone: "danger" },
    resolvido: { label: "Resolvido", tone: "success" },
  },
} satisfies Record<string, Record<string, StatusMeta>>;

export type StatusDomain = keyof typeof statusMaps;

export function getStatusMeta(domain: StatusDomain, status: string): StatusMeta {
  const map = statusMaps[domain] as Record<string, StatusMeta>;
  return map[status] ?? { label: status, tone: "neutral" };
}

export const formaPagamentoLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  pix: "PIX",
  boleto: "Boleto",
  convenio: "Convênio",
};

export const tipoVinculoLabels: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  autonomo: "Autônomo",
};

export const formaRemuneracaoLabels: Record<string, string> = {
  fixo: "Fixo",
  comissao: "Comissão",
  misto: "Misto",
};

export const sexoLabels: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
};

export const estadoCivilLabels: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
  uniao_estavel: "União estável",
};

export const diasSemana = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export const diasSemanaCurto = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
