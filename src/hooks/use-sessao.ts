"use client";

import * as React from "react";
import { create } from "zustand";

import { clearToken, getToken } from "@/lib/api";
import { comparouPlanos, LIMITES_PLANO, planoEstaAcimaDoTeto } from "@/lib/plano";
import { LIMITES_UNIDADES, modulosDoPlano } from "@/lib/modulos-plano";
import { encerrarSessaoApi, gravarUltimaUnidade, selecionarUnidade } from "@/services/auth";
import { useEntidadeLabelsStore } from "@/hooks/use-entidade-labels";
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
  clinicaNome: string | null,
  clinicaId: string | null,
  primeiroAcesso = false,
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
    clinicaNome,
    clinicaId,
    plano,
    usoUsuarios,
    planoEvento,
    tema: usuario.tema === "escuro" ? "escuro" : "claro",
    primeiroAcesso,
  };
}

function chavePlanoVisto(clinicaId: string | null | undefined) {
  return clinicaId ? `${STORAGE_PLANO_VISTO}.${clinicaId}` : STORAGE_PLANO_VISTO;
}

function lerPlanoVisto(clinicaId: string | null | undefined) {
  if (typeof window === "undefined") return null;
  if (!clinicaId) return window.localStorage.getItem(STORAGE_PLANO_VISTO);
  return window.localStorage.getItem(chavePlanoVisto(clinicaId)) ?? window.localStorage.getItem(STORAGE_PLANO_VISTO);
}

function gravarPlanoVisto(codigo: string, clinicaId: string | null | undefined) {
  window.localStorage.setItem(chavePlanoVisto(clinicaId), codigo);
}

function asCodigoPlano(valor: string | null): CodigoPlano | null {
  if (valor === "essencial" || valor === "profissional" || valor === "ilimitado") return valor;
  return null;
}

function resolverEvento(
  planoAnterior: PlanoAtual | null | undefined,
  plano: PlanoAtual | null,
  uso: UsoUsuarios | null,
  clinicaId: string | null | undefined,
): SessaoUsuario["planoEvento"] {
  if (planoEstaAcimaDoTeto(uso)) return "downgrade";
  if (!plano) return null;

  const visto = asCodigoPlano(lerPlanoVisto(clinicaId));
  const referencia: PlanoAtual | null =
    planoAnterior ??
    (visto
      ? {
          codigo: visto,
          nome: "",
          limiteUsuarios: LIMITES_PLANO[visto],
          limiteUnidades: LIMITES_UNIDADES[visto],
          modulos: modulosDoPlano(visto),
        }
      : null);

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
    // Sem unidade e sem primeiro acesso: sessão inválida (não reabrir módulos).
    if (!parsed.primeiroAcesso && !parsed.unidadeAtualId?.trim()) return null;
    return {
      ...parsed,
      perfilId: parsed.perfilId ?? "",
      permissoes: Array.isArray(parsed.permissoes) ? normalizarPermissoes(parsed.permissoes) : null,
      plano: parsed.plano
        ? {
            ...parsed.plano,
            limiteUnidades: parsed.plano.limiteUnidades ?? LIMITES_UNIDADES[parsed.plano.codigo] ?? null,
            modulos: parsed.plano.modulos?.length ? parsed.plano.modulos : modulosDoPlano(parsed.plano.codigo),
          }
        : null,
      usoUsuarios: parsed.usoUsuarios ?? null,
      planoEvento: resolverEvento(null, parsed.plano, parsed.usoUsuarios, parsed.clinicaId),
      clinicaNome: parsed.clinicaNome ?? null,
      clinicaId: parsed.clinicaId ?? null,
      tema: parsed.tema === "escuro" ? "escuro" : parsed.tema === "claro" ? "claro" : undefined,
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
    clinicaNome?: string | null,
    clinicaId?: string | null,
    primeiroAcesso?: boolean,
  ) => void;
  aplicarContextoPlano: (input: {
    usuario?: Usuario;
    unidades?: Unidade[];
    unidadeAtualId?: string | null;
    clinicaNome?: string | null;
    clinicaId?: string | null;
    plano: PlanoAtual | null;
    usoUsuarios: UsoUsuarios | null;
    permissoes?: Permissao[] | null;
    perfilId?: string;
    tema?: "claro" | "escuro";
  }) => void;
  atualizarUso: (usoUsuarios: UsoUsuarios) => void;
  atualizarClinicaNome: (clinicaNome: string) => void;
  atualizarUnidadesSessao: (unidades: Unidade[]) => void;
  atualizarTemaSessao: (tema: "claro" | "escuro") => void;
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
    const sessao = lerStorage();
    if (!sessao) {
      clearToken();
      limparStorage();
      set({ sessao: null, hidratado: true, lembrar: false });
      return;
    }
    set({ sessao, hidratado: true, lembrar: persistida });
  },
  iniciarSessao: (usuario, unidadeAtualId, unidades, lembrar, plano = null, usoUsuarios = null, permissoes = null, clinicaNome = null, clinicaId = null, primeiroAcesso = false) => {
    // Não persiste sessão de módulos sem unidade escolhida.
    if (!primeiroAcesso && !unidadeAtualId?.trim()) {
      return;
    }

    useEntidadeLabelsStore.getState().limpar();
    const evento = resolverEvento(null, plano, usoUsuarios, clinicaId);
    const sessao = montarSessao(
      usuario,
      unidadeAtualId,
      unidades,
      plano,
      usoUsuarios,
      evento,
      permissoes == null ? null : normalizarPermissoes(permissoes),
      clinicaNome,
      clinicaId,
      primeiroAcesso,
    );
    if (plano && evento !== "upgrade") gravarPlanoVisto(plano.codigo, clinicaId);
    if (clinicaId && unidadeAtualId) gravarUltimaUnidade(clinicaId, unidadeAtualId);
    gravarStorage(sessao, lembrar);
    set({ sessao, lembrar });
  },
  aplicarContextoPlano: (input) => {
    const atual = get().sessao;
    if (!atual) return;
    const clinicaId = input.clinicaId ?? atual.clinicaId;
    const evento = resolverEvento(atual.plano, input.plano, input.usoUsuarios, clinicaId);
    const sessao: SessaoUsuario = {
      ...atual,
      nome: input.usuario?.nome ?? atual.nome,
      email: input.usuario?.email ?? atual.email,
      perfil: input.usuario?.perfilNome ?? atual.perfil,
      perfilId: input.perfilId ?? input.usuario?.perfilId ?? atual.perfilId,
      permissoes: input.permissoes !== undefined ? normalizarPermissoes(input.permissoes) : atual.permissoes,
      unidades: input.unidades ?? atual.unidades,
      clinicaNome: input.clinicaNome ?? atual.clinicaNome,
      clinicaId,
      unidadeAtualId: input.unidadeAtualId ?? atual.unidadeAtualId,
      plano: input.plano,
      usoUsuarios: input.usoUsuarios,
      planoEvento: evento,
      tema: input.usuario?.tema ?? input.tema ?? atual.tema,
    };
    gravarStorage(sessao, get().lembrar);
    if (input.plano && evento !== "upgrade") gravarPlanoVisto(input.plano.codigo, clinicaId);
    set({ sessao });
  },
  atualizarUso: (usoUsuarios) => {
    const atual = get().sessao;
    if (!atual) return;
    const evento = resolverEvento(atual.plano, atual.plano, usoUsuarios, atual.clinicaId);
    const sessao = { ...atual, usoUsuarios, planoEvento: evento };
    if (evento !== "downgrade" && atual.plano) gravarPlanoVisto(atual.plano.codigo, atual.clinicaId);
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  atualizarClinicaNome: (clinicaNome) => {
    const atual = get().sessao;
    if (!atual) return;
    const sessao = { ...atual, clinicaNome };
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  atualizarUnidadesSessao: (unidades) => {
    const atual = get().sessao;
    if (!atual) return;
    const sessao = {
      ...atual,
      unidades,
      unidadesAcesso: unidades.map((item) => item.id),
    };
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  atualizarTemaSessao: (tema) => {
    const atual = get().sessao;
    if (!atual || atual.tema === tema) return;
    const sessao = { ...atual, tema };
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  dispensarAvisoUpgrade: () => {
    const atual = get().sessao;
    if (!atual?.plano) return;
    gravarPlanoVisto(atual.plano.codigo, atual.clinicaId);
    const sessao = { ...atual, planoEvento: null };
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  setUnidade: async (unidadeAtualId) => {
    const atual = get().sessao;
    if (!atual || atual.unidadeAtualId === unidadeAtualId) return;

    const resultado = await selecionarUnidade(unidadeAtualId, get().lembrar);
    const sessao = { ...atual, unidadeAtualId: resultado.unidadeAtualId };
    gravarUltimaUnidade(atual.clinicaId, resultado.unidadeAtualId);
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  encerrarSessao: () => {
    void encerrarSessaoApi();
    clearToken();
    limparStorage();
    useEntidadeLabelsStore.getState().limpar();
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
