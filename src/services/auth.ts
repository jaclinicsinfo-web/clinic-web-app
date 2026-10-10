import { api, ApiError, clearToken, setMemoryToken, setToken } from "@/lib/api";
import { modulosDoPlano } from "@/lib/modulos-plano";
import { normalizarPermissoes } from "@/lib/permissoes";
import { lerAcessoGratuito } from "@/lib/acesso-gratuito";
import { lerBloqueioCobranca, type BloqueioCobranca } from "@/services/assinatura";
import type { AcessoGratuito, PerfilSessao, Permissao, PlanoAtual, Unidade, UsoUsuarios, Usuario } from "@/types";

const STORAGE_ULTIMA_UNIDADE = "clinicerp.ultimaUnidade";

export function lerUltimaUnidade(clinicaId: string | null | undefined): string | null {
  if (typeof window === "undefined" || !clinicaId) return null;
  return window.localStorage.getItem(`${STORAGE_ULTIMA_UNIDADE}.${clinicaId}`);
}

export function gravarUltimaUnidade(clinicaId: string | null | undefined, unidadeId: string) {
  if (typeof window === "undefined" || !clinicaId || !unidadeId) return;
  window.localStorage.setItem(`${STORAGE_ULTIMA_UNIDADE}.${clinicaId}`, unidadeId);
}

export type ResultadoLogin =
  | {
      ok: true;
      usuario: Usuario;
      unidades: Unidade[];
      unidadeAtualId: string | null;
      clinicaNome: string | null;
      clinicaId: string | null;
      plano: PlanoAtual | null;
      usoUsuarios: UsoUsuarios | null;
      acessoGratuito: AcessoGratuito | null;
  permissoes: Permissao[] | null;
  perfilId: string;
  isolarDados: boolean;
  primeiroAcesso: boolean;
}
  | { ok: false; erro: string; bloqueio?: BloqueioCobranca | null };

export interface ContextoAuth {
  usuario: Usuario;
  unidades: Unidade[];
  unidadeAtualId: string | null;
  clinicaNome: string | null;
  clinicaId: string | null;
  plano: PlanoAtual | null;
  usoUsuarios: UsoUsuarios | null;
  acessoGratuito: AcessoGratuito | null;
  permissoes: Permissao[] | null;
  perfilId: string;
  isolarDados: boolean;
}

export interface SessaoApi extends ContextoAuth {
  token: string;
  perfil?: PerfilSessao;
  primeiroAcesso?: boolean;
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
  const codigo = plano.codigo;
  return {
    codigo,
    nome: plano.nome,
    limiteUsuarios: plano.limiteUsuarios ?? null,
    limiteUnidades: plano.limiteUnidades ?? (codigo === "essencial" ? 1 : null),
    modulos: plano.modulos?.length ? plano.modulos : modulosDoPlano(codigo),
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

function lerIsolamento(raw: Partial<SessaoApi> | null | undefined) {
  return Boolean(raw?.perfil?.isolarDados);
}

function lerPermissoes(raw: Partial<SessaoApi> | null | undefined): Permissao[] | null {
  const bruto = raw?.perfil?.permissoes ?? raw?.permissoes;
  if (bruto == null) return null;
  return normalizarPermissoes(bruto);
}

function montarResultadoLogin(data: SessaoApi): Extract<ResultadoLogin, { ok: true }> {
  return {
    ok: true,
    usuario: data.usuario,
    unidades: data.unidades,
    unidadeAtualId: data.unidadeAtualId,
    clinicaNome: data.clinicaNome ?? null,
    clinicaId: data.clinicaId ?? null,
    plano: lerPlano(data),
    usoUsuarios: lerUso(data),
    acessoGratuito: lerAcessoGratuito(data.acessoGratuito),
    permissoes: lerPermissoes(data),
    perfilId: data.perfil?.id ?? data.usuario.perfilId,
    isolarDados: lerIsolamento(data),
    primeiroAcesso: Boolean(data.primeiroAcesso),
  };
}

export function persistirSessao(data: SessaoApi, lembrar: boolean): Extract<ResultadoLogin, { ok: true }> {
  setToken(data.token, lembrar);
  return montarResultadoLogin(data);
}

function podePersistirNoLogin(data: SessaoApi): boolean {
  if (data.primeiroAcesso) return true;
  if (data.unidades.length === 1) return true;
  return Boolean(data.unidadeAtualId);
}

export async function autenticar(email: string, senha: string, lembrar: boolean): Promise<ResultadoLogin> {
  clearToken();

  try {
    const data = await api.post<SessaoApi>("/auth/login", { email, senha, lembrar });

    // Multi-unidade: JWT fica só em memória até /auth/selecionar-unidade.
    if (!podePersistirNoLogin(data)) {
      setMemoryToken(data.token);
      return montarResultadoLogin(data);
    }

    return persistirSessao(data, lembrar);
  } catch (error) {
    return {
      ok: false,
      erro: mensagemErro(error, "Não foi possível entrar. Tente novamente."),
      bloqueio: error instanceof ApiError && error.status === 403 ? lerBloqueioCobranca(error.details) : null,
    };
  }
}

export async function concluirPrimeiroAcesso(
  dados: { unidadeNome: string; unidadeCidade: string; adminNome: string },
  lembrar: boolean,
) {
  const data = await api.post<SessaoApi>("/auth/primeiro-acesso", dados);
  return persistirSessao(data, lembrar);
}

export async function selecionarUnidade(unidadeId: string, lembrar: boolean) {
  const data = await api.post<SelecionarUnidadeResponse>("/auth/selecionar-unidade", { unidadeId });
  setToken(data.token, lembrar);
  return data;
}

export function descartarLoginPendente() {
  clearToken();
}

export async function obterSessaoAtual(): Promise<ContextoAuth | null> {
  try {
    const data = await api.get<SessaoApi>("/auth/me");
    return {
      usuario: data.usuario,
      unidades: data.unidades,
      unidadeAtualId: data.unidadeAtualId,
      clinicaNome: data.clinicaNome ?? null,
      clinicaId: data.clinicaId ?? null,
      plano: lerPlano(data),
      usoUsuarios: lerUso(data),
      acessoGratuito: lerAcessoGratuito(data.acessoGratuito),
      permissoes: lerPermissoes(data),
      perfilId: data.perfil?.id ?? data.usuario.perfilId,
      isolarDados: lerIsolamento(data),
    };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    return null;
  }
}

export async function salvarTemaApi(tema: "claro" | "escuro") {
  return api.patch<{ tema: "claro" | "escuro" }>("/auth/tema", { tema });
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

export async function solicitarRecuperacaoSenha(email: string) {
  return api.post<{ mensagem: string }>("/auth/recuperar-senha", { email });
}

export async function redefinirSenhaApi(token: string, senha: string) {
  return api.post<{ mensagem: string }>("/auth/redefinir-senha", { token, senha });
}
