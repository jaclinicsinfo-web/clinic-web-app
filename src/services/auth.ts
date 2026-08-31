import { api, ApiError, clearToken, setToken } from "@/lib/api";
import { normalizarPermissoes } from "@/lib/permissoes";
import type { PerfilSessao, Permissao, PlanoAtual, Unidade, UsoUsuarios, Usuario } from "@/types";

export type ResultadoLogin =
  | {
      ok: true;
      usuario: Usuario;
      unidades: Unidade[];
      unidadeAtualId: string | null;
      clinicaNome: string | null;
      plano: PlanoAtual | null;
      usoUsuarios: UsoUsuarios | null;
      permissoes: Permissao[] | null;
      perfilId: string;
    }
  | { ok: false; erro: string };

export interface ContextoAuth {
  usuario: Usuario;
  unidades: Unidade[];
  unidadeAtualId: string | null;
  clinicaNome: string | null;
  plano: PlanoAtual | null;
  usoUsuarios: UsoUsuarios | null;
  permissoes: Permissao[] | null;
  perfilId: string;
}

export interface SessaoApi extends ContextoAuth {
  token: string;
  perfil?: PerfilSessao;
}

interface SelecionarUnidadeResponse {
  token: string;
  unidadeAtualId: string;
  unidade: Unidade;
}

function mensagemErro(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.message) return error.message;
  return fallback;
}

function lerPlano(raw: Partial<SessaoApi> | null | undefined): PlanoAtual | null {
  const plano = raw?.plano;
  if (!plano?.codigo) return null;
  return {
    codigo: plano.codigo,
    nome: plano.nome,
    limiteUsuarios: plano.limiteUsuarios ?? null,
  };
}

function lerUso(raw: Partial<SessaoApi> | null | undefined): UsoUsuarios | null {
  const uso = raw?.usoUsuarios;
  if (!uso || typeof uso.usados !== "number") return null;
  const limite = uso.limite ?? null;
  return {
    usados: uso.usados,
    limite,
    podeAdicionar: uso.podeAdicionar ?? (limite === null || uso.usados < limite),
  };
}

function lerPermissoes(raw: Partial<SessaoApi> | null | undefined): Permissao[] | null {
  const bruto = raw?.perfil?.permissoes ?? raw?.permissoes;
  if (bruto == null) return null;
  return normalizarPermissoes(bruto);
}

export function persistirSessao(data: SessaoApi, lembrar: boolean): Extract<ResultadoLogin, { ok: true }> {
  setToken(data.token, lembrar);
  return {
    ok: true,
    usuario: data.usuario,
    unidades: data.unidades,
    unidadeAtualId: data.unidadeAtualId,
    clinicaNome: data.clinicaNome ?? null,
    plano: lerPlano(data),
    usoUsuarios: lerUso(data),
    permissoes: lerPermissoes(data),
    perfilId: data.perfil?.id ?? data.usuario.perfilId,
  };
}

export async function autenticar(email: string, senha: string, lembrar: boolean): Promise<ResultadoLogin> {
  clearToken();

  try {
    const data = await api.post<SessaoApi>("/auth/login", { email, senha, lembrar });
    return persistirSessao(data, lembrar);
  } catch (error) {
    return { ok: false, erro: mensagemErro(error, "Não foi possível entrar. Tente novamente.") };
  }
}

export async function selecionarUnidade(unidadeId: string, lembrar: boolean) {
  const data = await api.post<SelecionarUnidadeResponse>("/auth/selecionar-unidade", { unidadeId });
  setToken(data.token, lembrar);
  return data;
}

export async function obterSessaoAtual(): Promise<ContextoAuth | null> {
  try {
    const data = await api.get<SessaoApi>("/auth/me");
    return {
      usuario: data.usuario,
      unidades: data.unidades,
      unidadeAtualId: data.unidadeAtualId,
      clinicaNome: data.clinicaNome ?? null,
      plano: lerPlano(data),
      usoUsuarios: lerUso(data),
      permissoes: lerPermissoes(data),
      perfilId: data.perfil?.id ?? data.usuario.perfilId,
    };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    return null;
  }
}

export async function encerrarSessaoApi() {
  try {
    await api.post("/auth/logout");
  } catch {
    // JWT é stateless; falha de rede não impede o logout local.
  } finally {
    clearToken();
  }
}
