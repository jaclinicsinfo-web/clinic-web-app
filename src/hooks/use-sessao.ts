"use client";

import * as React from "react";
import { create } from "zustand";

import { clearToken, getToken } from "@/lib/api";
import { comparouPlanos, LIMITES_PLANO, planoEstaAcimaDoTeto } from "@/lib/plano";
import { encerrarSessaoApi, selecionarUnidade } from "@/services/auth";
import { normalizarPermissoes } from "@/lib/permissoes";
import type { CodigoPlano, Permissao, PlanoAtual, SessaoUsuario, Unidade, UsoUsuarios, Usuario } from "@/types";

const STORAGE_LOCAL = "clinicerp.sessao";
const STORAGE_TEMP = "clinicerp.sessao.temp";
const STORAGE_PLANO_VISTO = "clinicerp.planoVisto";

function montarSessao(
  usuario: Usuario,
  unidadeAtualId: string,
  unidades: Unidade[],
  plano: PlanoAtual | null,
  usoUsuarios: UsoUsuarios | null,
  planoEvento: SessaoUsuario["planoEvento"],
  permissoes: Permissao[] | null,
): SessaoUsuario {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfilNome,
    perfilId: usuario.perfilId,
    permissoes,
    unidadeAtualId,
    unidadesAcesso: usuario.unidadesAcesso,
    unidades,
    plano,
    usoUsuarios,
    planoEvento,
  };
}

function lerPlanoVisto() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_PLANO_VISTO);
}

function gravarPlanoVisto(codigo: string) {
  window.localStorage.setItem(STORAGE_PLANO_VISTO, codigo);
}

function asCodigoPlano(valor: string | null): CodigoPlano | null {
  if (valor === "essencial" || valor === "profissional" || valor === "ilimitado") return valor;
  return null;
}

function resolverEvento(
  planoAnterior: PlanoAtual | null | undefined,
  plano: PlanoAtual | null,
  uso: UsoUsuarios | null,
): SessaoUsuario["planoEvento"] {
  if (planoEstaAcimaDoTeto(uso)) return "downgrade";
  if (!plano) return null;

  const visto = asCodigoPlano(lerPlanoVisto());
  const referencia: PlanoAtual | null =
    planoAnterior ??
    (visto ? { codigo: visto, nome: "", limiteUsuarios: LIMITES_PLANO[visto] } : null);

  if (!referencia || referencia.codigo === plano.codigo) return null;

  const mudanca = comparouPlanos(referencia, plano);
  if (mudanca === "upgrade" && visto !== plano.codigo) return "upgrade";
  return null;
}

function lerStorage(): SessaoUsuario | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_LOCAL) ?? window.sessionStorage.getItem(STORAGE_TEMP);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessaoUsuario;
    if (!parsed?.id || !Array.isArray(parsed.unidades)) return null;
    return {
      ...parsed,
      perfilId: parsed.perfilId ?? "",
      permissoes: Array.isArray(parsed.permissoes) ? normalizarPermissoes(parsed.permissoes) : null,
      plano: parsed.plano ?? null,
      usoUsuarios: parsed.usoUsuarios ?? null,
      planoEvento: resolverEvento(null, parsed.plano, parsed.usoUsuarios),
    };
  } catch {
    return null;
  }
}

function gravarStorage(sessao: SessaoUsuario, lembrar: boolean) {
  const raw = JSON.stringify(sessao);

  if (lembrar) {
    window.localStorage.setItem(STORAGE_LOCAL, raw);
    window.sessionStorage.removeItem(STORAGE_TEMP);
    return;
  }

  window.sessionStorage.setItem(STORAGE_TEMP, raw);
  window.localStorage.removeItem(STORAGE_LOCAL);
}

function limparStorage() {
  window.localStorage.removeItem(STORAGE_LOCAL);
  window.sessionStorage.removeItem(STORAGE_TEMP);
}

interface SessaoState {
  sessao: SessaoUsuario | null;
  hidratado: boolean;
  lembrar: boolean;
  hidratar: () => void;
  iniciarSessao: (
    usuario: Usuario,
    unidadeAtualId: string,
    unidades: Unidade[],
    lembrar: boolean,
    plano?: PlanoAtual | null,
    usoUsuarios?: UsoUsuarios | null,
    permissoes?: Permissao[] | null,
  ) => void;
  aplicarContextoPlano: (input: {
    usuario?: Usuario;
    unidades?: Unidade[];
    unidadeAtualId?: string | null;
    plano: PlanoAtual | null;
    usoUsuarios: UsoUsuarios | null;
    permissoes?: Permissao[] | null;
    perfilId?: string;
  }) => void;
  atualizarUso: (usoUsuarios: UsoUsuarios) => void;
  dispensarAvisoUpgrade: () => void;
  setUnidade: (unidadeAtualId: string) => Promise<void>;
  encerrarSessao: () => void;
}

export const useSessaoStore = create<SessaoState>((set, get) => ({
  sessao: null,
  hidratado: false,
  lembrar: true,
  hidratar: () => {
    if (get().hidratado) return;
    const token = getToken();
    const persistida = typeof window !== "undefined" && Boolean(window.localStorage.getItem(STORAGE_LOCAL));
    if (!token) {
      limparStorage();
      set({ sessao: null, hidratado: true, lembrar: persistida });
      return;
    }
    set({ sessao: lerStorage(), hidratado: true, lembrar: persistida });
  },
  iniciarSessao: (usuario, unidadeAtualId, unidades, lembrar, plano = null, usoUsuarios = null, permissoes = null) => {
    const evento = resolverEvento(null, plano, usoUsuarios);
    const sessao = montarSessao(
      usuario,
      unidadeAtualId,
      unidades,
      plano,
      usoUsuarios,
      evento,
      permissoes == null ? null : normalizarPermissoes(permissoes),
    );
    if (plano && evento !== "upgrade") gravarPlanoVisto(plano.codigo);
    gravarStorage(sessao, lembrar);
    set({ sessao, lembrar });
  },
  aplicarContextoPlano: (input) => {
    const atual = get().sessao;
    if (!atual) return;
    const evento = resolverEvento(atual.plano, input.plano, input.usoUsuarios);
    const sessao: SessaoUsuario = {
      ...atual,
      nome: input.usuario?.nome ?? atual.nome,
      email: input.usuario?.email ?? atual.email,
      perfil: input.usuario?.perfilNome ?? atual.perfil,
      perfilId: input.perfilId ?? input.usuario?.perfilId ?? atual.perfilId,
      permissoes: input.permissoes !== undefined ? normalizarPermissoes(input.permissoes) : atual.permissoes,
      unidades: input.unidades ?? atual.unidades,
      unidadeAtualId: input.unidadeAtualId ?? atual.unidadeAtualId,
      plano: input.plano,
      usoUsuarios: input.usoUsuarios,
      planoEvento: evento,
    };
    gravarStorage(sessao, get().lembrar);
    if (input.plano && evento !== "upgrade") gravarPlanoVisto(input.plano.codigo);
    set({ sessao });
  },
  atualizarUso: (usoUsuarios) => {
    const atual = get().sessao;
    if (!atual) return;
    const evento = resolverEvento(atual.plano, atual.plano, usoUsuarios);
    const sessao = { ...atual, usoUsuarios, planoEvento: evento };
    if (evento !== "downgrade" && atual.plano) gravarPlanoVisto(atual.plano.codigo);
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  dispensarAvisoUpgrade: () => {
    const atual = get().sessao;
    if (!atual?.plano) return;
    gravarPlanoVisto(atual.plano.codigo);
    const sessao = { ...atual, planoEvento: null };
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  setUnidade: async (unidadeAtualId) => {
    const atual = get().sessao;
    if (!atual || atual.unidadeAtualId === unidadeAtualId) return;

    const resultado = await selecionarUnidade(unidadeAtualId, get().lembrar);
    const sessao = { ...atual, unidadeAtualId: resultado.unidadeAtualId };
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  encerrarSessao: () => {
    void encerrarSessaoApi();
    clearToken();
    limparStorage();
    set({ sessao: null });
  },
}));

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const hidratar = useSessaoStore((state) => state.hidratar);

  React.useEffect(() => {
    hidratar();
  }, [hidratar]);

  return children;
}
