"use client";

import { create } from "zustand";

interface EntidadeLabelsState {
  pacientes: Record<string, string>;
  profissionais: Record<string, string>;
  convenios: Record<string, string>;
  setPaciente: (id: string, nome: string) => void;
  setProfissional: (id: string, nome: string) => void;
  setConvenio: (id: string, nome: string) => void;
  limpar: () => void;
}

export const useEntidadeLabelsStore = create<EntidadeLabelsState>((set) => ({
  pacientes: {},
  profissionais: {},
  convenios: {},
  setPaciente: (id, nome) => set((state) => ({ pacientes: { ...state.pacientes, [id]: nome } })),
  setProfissional: (id, nome) =>
    set((state) => ({ profissionais: { ...state.profissionais, [id]: nome } })),
  setConvenio: (id, nome) => set((state) => ({ convenios: { ...state.convenios, [id]: nome } })),
  limpar: () => set({ pacientes: {}, profissionais: {}, convenios: {} }),
}));
