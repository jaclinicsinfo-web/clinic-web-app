import { api } from "@/lib/api";
import type { Comissao } from "@/types";

export type PeriodoRelatorio = "mes" | "anterior" | "30d" | "12m" | "ano";

export const periodosRelatorio: { id: PeriodoRelatorio; label: string }[] = [
  { id: "mes", label: "Este mês" },
  { id: "anterior", label: "Mês anterior" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "12m", label: "Últimos 12 meses" },
  { id: "ano", label: "Ano corrente" },
];

export interface RelatoriosData {
  intervalo: { inicio: string; fim: string; label: string };
  faturamento: {
    total: number;
    quantidade: number;
    ticketMedio: number;
    evolucao: { periodo: string; valor: number }[];
    porProfissional: { id: string; nome: string; atendimentos: number; valor: number }[];
    porConvenio: { id: string; nome: string; atendimentos: number; valor: number }[];
    porProcedimento: { id: string; nome: string; quantidade: number; valor: number }[];
  };
  atendimentos: {
    realizados: number;
    cancelados: number;
    faltas: number;
    total: number;
    porStatus: { nome: string; valor: number }[];
    evolucao: { periodo: string; realizados: number; cancelados: number; faltas: number }[];
  };
  inadimplencia: {
    total: number;
    quantidade: number;
    pacientes: { id: string; nome: string; valor: number; cobrancas: number }[];
  };
  pacientes: {
    novos: number;
    recorrentes: number;
    evolucao: { periodo: string; novos: number; recorrentes: number }[];
  };
  produtividade: {
    id: string;
    nome: string;
    especialidade: string;
    agendamentos: number;
    realizados: number;
    faltas: number;
    faturamento: number;
    ocupacao: number;
  }[];
  comissoes: {
    total: number;
    lista: Comissao[];
  };
  conveniosAtivos: number;
}

export async function obterRelatoriosApi(periodo: PeriodoRelatorio) {
  return api.get<RelatoriosData>("/relatorios", { params: { periodo } });
}
