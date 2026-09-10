"use client";

import * as React from "react";

import { aplicarTema, lerTema, TEMA_STORAGE_KEY, temaValido, type TemaSistema } from "@/lib/tema";

interface TemaContextValue {
  tema: TemaSistema;
  setTema: (tema: TemaSistema) => void;
  toggleTema: () => void;
}

const TemaContext = React.createContext<TemaContextValue | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = React.useState<TemaSistema>("claro");

  React.useEffect(() => {
    setTemaState(lerTema());
  }, []);

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

  const setTema = React.useCallback((proximo: TemaSistema) => {
    setTemaState(proximo);
    aplicarTema(proximo);
  }, []);

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
