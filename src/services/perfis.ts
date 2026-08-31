import { api } from "@/lib/api";
import type { PerfilAcesso, Permissao } from "@/types";

export async function listarPerfisApi() {
  const data = await api.get<{ perfis: PerfilAcesso[] }>("/perfis");
  return data.perfis;
}

export async function salvarPermissoesApi(id: string, permissoes: Permissao[]) {
  const data = await api.patch<{ perfil: PerfilAcesso }>(`/perfis/${id}`, { permissoes });
  return data.perfil;
}
