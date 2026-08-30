"use client";

import * as React from "react";
import { create } from "zustand";

import type { SessaoUsuario, Usuario } from "@/types";

const STORAGE_LOCAL = "clinicerp.sessao";
const STORAGE_TEMP = "clinicerp.sessao.temp";

function montarSessao(usuario: Usuario, unidadeAtualId: string): SessaoUsuario {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfilNome,
    unidadeAtualId,
    unidadesAcesso: usuario.unidadesAcesso,
  };
}

function lerStorage(): SessaoUsuario | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_LOCAL) ?? window.sessionStorage.getItem(STORAGE_TEMP);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessaoUsuario;
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
  iniciarSessao: (usuario: Usuario, unidadeAtualId: string, lembrar: boolean) => void;
  setUnidade: (unidadeAtualId: string) => void;
  encerrarSessao: () => void;
}

export const useSessaoStore = create<SessaoState>((set, get) => ({
  sessao: null,
  hidratado: false,
  lembrar: true,
  hidratar: () => {
    if (get().hidratado) return;
    const persistida = typeof window !== "undefined" && Boolean(window.localStorage.getItem(STORAGE_LOCAL));
    set({ sessao: lerStorage(), hidratado: true, lembrar: persistida });
  },
  iniciarSessao: (usuario, unidadeAtualId, lembrar) => {
    const sessao = montarSessao(usuario, unidadeAtualId);
    gravarStorage(sessao, lembrar);
    set({ sessao, lembrar });
  },
  setUnidade: (unidadeAtualId) => {
    const atual = get().sessao;
    if (!atual) return;
    const sessao = { ...atual, unidadeAtualId };
    gravarStorage(sessao, get().lembrar);
    set({ sessao });
  },
  encerrarSessao: () => {
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
