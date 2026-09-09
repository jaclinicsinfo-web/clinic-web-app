"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { ApiError } from "@/lib/api";
import { useSessaoStore } from "@/hooks/use-sessao";
import { obterSessaoAtual } from "@/services/auth";

export function PlanoSync() {
  const pathname = usePathname();
  const aplicarContextoPlano = useSessaoStore((state) => state.aplicarContextoPlano);
  const encerrarSessao = useSessaoStore((state) => state.encerrarSessao);

  React.useEffect(() => {
    let cancelado = false;

    obterSessaoAtual()
      .then((contexto) => {
        if (cancelado || !contexto) return;
        aplicarContextoPlano({
          ...contexto,
          perfilId: contexto.perfilId,
          permissoes: contexto.permissoes,
        });
      })
      .catch((error) => {
        if (cancelado) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          encerrarSessao();
        }
      });

    return () => {
      cancelado = true;
    };
  }, [pathname, aplicarContextoPlano, encerrarSessao]);

  return null;
}
