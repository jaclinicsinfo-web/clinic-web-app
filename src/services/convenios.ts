import { api } from "@/lib/api";
import type { Convenio, Procedimento } from "@/types";

export interface ResumoConvenios {
  total: number;
  ativos: number;
  exigemAutorizacao: number;
  prazoMedio: number;
}

export interface IndicadoresConvenio {
  pacientesVinculados: number;
  atendimentosMes: number;
  faturamentoMes: number;
  taxaGlosa: number;
}

export interface PacienteConvenio {
  id: string;
  nome: string;
  numeroCarteirinha: string | null;
  status: string;
}

export interface ConvenioPayload {
  nome: string;
  registroAns: string;
  prazoPagamentoDias: number;
  exigeAutorizacaoPrevia: boolean;
  contatoNome: string;
  contatoTelefone: string;
  portalUrl: string | null;
  status: "ativo" | "inativo";
}

export async function listarConveniosApi() {
  return api.get<{ convenios: Convenio[]; resumo: ResumoConvenios }>("/convenios");
}

export async function obterConvenioApi(id: string) {
  return api.get<{
    convenio: Convenio;
    indicadores: IndicadoresConvenio;
    pacientes: PacienteConvenio[];
    procedimentos: Procedimento[];
  }>(`/convenios/${id}`);
}

export async function criarConvenioApi(payload: ConvenioPayload) {
  const data = await api.post<{ convenio: Convenio }>("/convenios", payload);
  return data.convenio;
}

export async function atualizarConvenioApi(id: string, payload: ConvenioPayload) {
  const data = await api.patch<{ convenio: Convenio }>(`/convenios/${id}`, payload);
  return data.convenio;
}

export async function inativarConvenioApi(id: string) {
  const data = await api.patch<{ convenio: Convenio }>(`/convenios/${id}/inativar`);
  return data.convenio;
}

export async function ativarConvenioApi(id: string) {
  const data = await api.patch<{ convenio: Convenio }>(`/convenios/${id}/ativar`);
  return data.convenio;
}

export async function salvarTabelaConvenioApi(id: string, precos: { procedimentoId: string; valor: number }[]) {
  const data = await api.put<{ convenio: Convenio }>(`/convenios/${id}/tabela`, { precos });
  return data.convenio;
}
