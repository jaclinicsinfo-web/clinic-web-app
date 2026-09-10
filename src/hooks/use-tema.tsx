"use client";

import * as React from "react";

import { useSessaoStore } from "@/hooks/use-sessao";
import { aplicarTema, lerTema, TEMA_STORAGE_KEY, temaValido, type TemaSistema } from "@/lib/tema";
import { salvarTemaApi } from "@/services/auth";

interface TemaContextValue {
  tema: TemaSistema;
  setTema: (tema: TemaSistema) => void;
  toggleTema: () => void;
}

const TemaContext = React.createContext<TemaContextValue | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = React.useState<TemaSistema>("claro");
  const sessaoId = useSessaoStore((state) => state.sessao?.id);
  const temaSessao = useSessaoStore((state) => state.sessao?.tema);
  const atualizarTemaSessao = useSessaoStore((state) => state.atualizarTemaSessao);

  React.useEffect(() => {
    setTemaState(lerTema());
  }, []);

  React.useEffect(() => {
    if (!temaValido(temaSessao)) return;
    setTemaState(temaSessao);
    aplicarTema(temaSessao);
  }, [temaSessao]);

  React.useEffect(() => {
    function sincronizar(event: StorageEvent) {
      if (event.key !== TEMA_STORAGE_KEY) return;
      const proximo = temaValido(event.newValue) ? event.newValue : "claro";
      setTemaState(proximo);
      aplicarTema(proximo);
    }
    window.addEventListener("storage", sincronizar);
    return () => window.removeEventListener("storage", sincronizar);
  }, []);

  const setTema = React.useCallback(
    (proximo: TemaSistema) => {
      setTemaState(proximo);
      aplicarTema(proximo);
      atualizarTemaSessao(proximo);
      if (!sessaoId) return;
      void salvarTemaApi(proximo).catch(() => {
        // Preferência local já foi aplicada; a API sincroniza no próximo login.
      });
    },
    [atualizarTemaSessao, sessaoId],
  );

  const toggleTema = React.useCallback(() => {
    setTema(tema === "escuro" ? "claro" : "escuro");
  }, [setTema, tema]);

  const value = React.useMemo(() => ({ tema, setTema, toggleTema }), [tema, setTema, toggleTema]);

  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const context = React.useContext(TemaContext);
  if (!context) {
    throw new Error("useTema deve ser usado dentro de TemaProvider.");
  }
  return context;
}
