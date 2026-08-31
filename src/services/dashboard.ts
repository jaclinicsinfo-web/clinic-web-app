import { api } from "@/lib/api";
import type { AgendamentoStatus } from "@/types";

export interface DashboardAtendimentosHoje {
  total: number;
  confirmados: number;
  agendados: number;
  cancelados: number;
}

export interface DashboardProximo {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  profissionalNome: string;
  procedimentoNome: string;
  horaInicio: string;
  sala: string | null;
  particular: boolean;
  valor: number;
  status: AgendamentoStatus;
}

export interface DashboardAniversariante {
  id: string;
  nome: string;
  dataNascimento: string;
  idade: number;
}

export interface DashboardAlerta {
  id: string;
  titulo: string;
  descricao: string;
  severidade: "alta" | "media" | "baixa";
  href: string;
}

export interface DashboardFinanceiro {
  faturamentoMes: number;
  variacaoFaturamento: number;
  faturamentoDia: number;
  contasAReceber: {
    vencendo7Dias: number;
    quantidadeVencendo7Dias: number;
    totalAtrasado: number;
  };
  contasAPagar: {
    vencendo7Dias: number;
    quantidadeVencendo7Dias: number;
    totalVencido: number;
  };
  faturamentoDiario: { periodo: string; valor: number }[];
  faturamentoMensal: { periodo: string; valor: number }[];
  origemAtendimento: { nome: string; valor: number }[];
  alertas: DashboardAlerta[];
}

export interface DashboardPayload {
  atendimentosHoje: DashboardAtendimentosHoje;
  taxaOcupacao: number;
  taxaFaltas: number;
  novosPacientes: number;
  variacaoNovosPacientes: number;
  atendimentosPorProfissional: { profissional: string; atendimentos: number; faturamento: number }[];
  funil: { etapa: string; quantidade: number }[];
  proximos: DashboardProximo[];
  aniversariantes: DashboardAniversariante[];
  financeiro: DashboardFinanceiro | null;
}

export async function obterDashboardApi() {
  return api.get<DashboardPayload>("/dashboard");
}
