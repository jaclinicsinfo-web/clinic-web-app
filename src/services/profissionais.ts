import { api } from "@/lib/api";
import type { Agendamento, Comissao, GradeHorario, Profissional } from "@/types";

export interface ResumoProfissionais {
  total: number;
  ativos: number;
  especialidades: number;
  comissaoMedia: number;
}

export interface IndicadoresProfissional {
  atendimentosMes: number;
  agendamentosMes: number;
  faturamentoGerado: number;
  taxaOcupacao: number;
  taxaFaltas: number;
  pacientesAtendidos: number;
  horasSemanais: number;
}

export interface PacienteDoProfissional {
  id: string;
  nome: string;
  telefone: string;
  convenio: string;
  status: string;
  atendimentos: number;
  ultimaVisita: string | null;
}

export interface UsuarioVinculo {
  id: string;
  nome: string;
  email: string;
  ocupado: boolean;
}

export interface ProcedimentoOpcao {
  id: string;
  nome: string;
  categoria: string;
  duracaoPadraoMin: number;
  valorParticular: number;
}

export interface ProfissionalPayload {
  nome: string;
  cpf: string;
  rg: string | null;
  email: string;
  telefone: string;
  especialidades: string[];
  conselho: string;
  registroConselho: string;
  tipoVinculo: Profissional["tipoVinculo"];
  dataAdmissao: string;
  formaRemuneracao: Profissional["formaRemuneracao"];
  percentualComissao: number;
  comissaoPorProcedimento: boolean;
  procedimentosHabilitados: string[];
  gradeHorarios: GradeHorario[];
  usuarioId: string | null;
  status?: "ativo" | "inativo";
}

export async function listarProfissionaisApi() {
  return api.get<{
    profissionais: Profissional[];
    especialidades: string[];
    resumo: ResumoProfissionais;
  }>("/profissionais");
}

export async function opcoesProfissionaisApi() {
  return api.get<{
    procedimentos: ProcedimentoOpcao[];
    usuarios: UsuarioVinculo[];
    especialidades: string[];
  }>("/profissionais/opcoes");
}

export async function obterProfissionalApi(id: string) {
  return api.get<{
    profissional: Profissional;
    indicadores: IndicadoresProfissional;
    pacientesAtendidos: PacienteDoProfissional[];
    agenda: Agendamento[];
    procedimentosHabilitados: { id: string; nome: string }[];
    comissoes: Comissao[];
  }>(`/profissionais/${id}`);
}

export async function criarProfissionalApi(payload: ProfissionalPayload) {
  const data = await api.post<{ profissional: Profissional }>("/profissionais", payload);
  return data.profissional;
}

export async function atualizarProfissionalApi(id: string, payload: ProfissionalPayload) {
  const data = await api.patch<{ profissional: Profissional }>(`/profissionais/${id}`, payload);
  return data.profissional;
}

export async function inativarProfissionalApi(id: string) {
  const data = await api.patch<{ profissional: Profissional }>(`/profissionais/${id}/inativar`);
  return data.profissional;
}

export async function ativarProfissionalApi(id: string) {
  const data = await api.patch<{ profissional: Profissional }>(`/profissionais/${id}/ativar`);
  return data.profissional;
}
