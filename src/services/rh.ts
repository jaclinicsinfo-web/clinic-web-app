import { api } from "@/lib/api";
import type { Holerite, RegistroPonto, TipoBatida, UsuarioRh } from "@/types";

export interface ResumoRh {
  usuariosAtivos: number;
  presentesHoje: number;
  ausentesHoje: number;
  incompletosHoje: number;
  holeritesCompetencia: number;
  semHolerite: number;
}

export interface VisaoRh {
  competencia: string;
  hoje: string;
  somenteProprios: boolean;
  resumo: ResumoRh;
  pontoHoje: RegistroPonto[];
  holeritesRecentes: Holerite[];
  usuarios: UsuarioRh[];
}

export interface ResumoPonto {
  registros: number;
  completos: number;
  emAndamento: number;
  presentesHoje: number;
  ausentesHoje: number;
  minutosTrabalhados: number;
}

export interface ListaPonto {
  inicio: string;
  fim: string;
  hoje: string;
  somenteProprios: boolean;
  registros: RegistroPonto[];
  usuarios: UsuarioRh[];
  resumo: ResumoPonto;
}

export interface ResumoHolerites {
  enviados: number;
  semHolerite: number;
  usuariosAtivos: number;
}

export interface ListaHolerites {
  competencia: string;
  competencias: string[];
  somenteProprios: boolean;
  holerites: Holerite[];
  usuarios: UsuarioRh[];
  resumo: ResumoHolerites;
}

export interface PontoPayload {
  usuarioId: string;
  data: string;
  entrada?: string | null;
  saidaIntervalo?: string | null;
  retornoIntervalo?: string | null;
  saida?: string | null;
  observacao?: string | null;
}

export async function obterVisaoRhApi() {
  return api.get<VisaoRh>("/rh");
}

export async function listarPontoApi(params?: { inicio?: string; fim?: string; usuarioId?: string }) {
  return api.get<ListaPonto>("/rh/ponto", { params });
}

export async function criarPontoApi(payload: PontoPayload) {
  const data = await api.post<{ registro: RegistroPonto }>("/rh/ponto", payload);
  return data.registro;
}

export async function baterPontoApi(tipo?: TipoBatida) {
  const data = await api.post<{ registro: RegistroPonto }>("/rh/ponto/bater", tipo ? { tipo } : {});
  return data.registro;
}

export async function atualizarPontoApi(id: string, payload: Omit<PontoPayload, "usuarioId" | "data">) {
  const data = await api.patch<{ registro: RegistroPonto }>(`/rh/ponto/${id}`, payload);
  return data.registro;
}

export async function excluirPontoApi(id: string) {
  await api.delete(`/rh/ponto/${id}`);
}

export async function listarHoleritesApi(params?: { competencia?: string; usuarioId?: string }) {
  return api.get<ListaHolerites>("/rh/holerites", { params });
}

export async function enviarHoleriteApi(usuarioId: string, competencia: string, arquivo: File) {
  const form = new FormData();
  form.append("arquivo", arquivo);
  form.append("usuarioId", usuarioId);
  form.append("competencia", competencia);
  const data = await api.upload<{ holerite: Holerite }>("/rh/holerites", form);
  return data.holerite;
}

export async function baixarHoleriteApi(id: string) {
  return api.blob(`/rh/holerites/${id}/arquivo`);
}

export async function excluirHoleriteApi(id: string) {
  await api.delete(`/rh/holerites/${id}`);
}
