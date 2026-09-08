import { api } from "@/lib/api";
import type { Procedimento } from "@/types";

export interface ProcedimentoPayload {
  nome: string;
  categoria: string;
  duracaoPadraoMin: number;
  valorParticular: number;
  status?: "ativo" | "inativo";
}

export async function listarProcedimentosApi() {
  return api.get<{ procedimentos: Procedimento[]; categorias: string[] }>("/procedimentos");
}

export async function criarProcedimentoApi(payload: ProcedimentoPayload) {
  const data = await api.post<{ procedimento: Procedimento }>("/procedimentos", payload);
  return data.procedimento;
}

export async function atualizarProcedimentoApi(id: string, payload: ProcedimentoPayload) {
  const data = await api.patch<{ procedimento: Procedimento }>(`/procedimentos/${id}`, payload);
  return data.procedimento;
}

export async function inativarProcedimentoApi(id: string) {
  const data = await api.patch<{ procedimento: Procedimento }>(`/procedimentos/${id}/inativar`);
  return data.procedimento;
}
