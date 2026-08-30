import { api } from "@/lib/api";
import type { PerfilAcesso, PlanoAtual, Unidade, UsoUsuarios, Usuario } from "@/types";

export interface ListaUsuariosResponse {
  usuarios: Usuario[];
  perfis: PerfilAcesso[];
  unidades: Unidade[];
  plano: PlanoAtual | null;
  usoUsuarios: UsoUsuarios | null;
}

export async function listarUsuariosApi() {
  return api.get<ListaUsuariosResponse>("/usuarios");
}

export async function criarUsuarioApi(input: {
  nome: string;
  email: string;
  senha: string;
  perfilId: string;
  unidadeId: string;
}) {
  return api.post<{ usuario: Usuario; usoUsuarios: UsoUsuarios }>("/usuarios", {
    nome: input.nome,
    email: input.email,
    senha: input.senha,
    perfilId: input.perfilId,
    unidadesIds: [input.unidadeId],
  });
}

export async function inativarUsuarioApi(id: string) {
  return api.patch<{ usuario: Usuario; usoUsuarios: UsoUsuarios }>(`/usuarios/${id}/inativar`);
}

export async function ativarUsuarioApi(id: string) {
  return api.patch<{ usuario: Usuario; usoUsuarios: UsoUsuarios }>(`/usuarios/${id}/ativar`);
}
