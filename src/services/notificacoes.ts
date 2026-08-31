import { api } from "@/lib/api";
import type { Notificacao } from "@/types";

export async function listarNotificacoesApi() {
  return api.get<{ notificacoes: Notificacao[]; naoLidas: number }>("/notificacoes");
}

export async function marcarNotificacaoLidaApi(id: string) {
  const data = await api.patch<{ notificacao: Notificacao }>(`/notificacoes/${id}/lida`);
  return data.notificacao;
}

export async function marcarNotificacoesLidasApi() {
  return api.post<{ notificacoes: Notificacao[]; naoLidas: number }>("/notificacoes/lidas");
}
