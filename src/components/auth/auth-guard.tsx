"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSessaoStore } from "@/hooks/use-sessao";

function sessaoSemUnidade(sessao: { unidadeAtualId?: string; primeiroAcesso?: boolean } | null) {
  if (!sessao || sessao.primeiroAcesso) return false;
  return !sessao.unidadeAtualId?.trim();
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hidratado = useSessaoStore((state) => state.hidratado);
  const sessao = useSessaoStore((state) => state.sessao);
  const encerrarSessao = useSessaoStore((state) => state.encerrarSessao);

  React.useEffect(() => {
    if (!hidratado) return;
    if (!sessao) {
      router.replace("/login");
      return;
    }
    if (sessao.primeiroAcesso) {
      router.replace("/primeiro-acesso");
      return;
    }
    // Sessão persistida sem unidade = estado inválido (ex.: token antigo multi-unidade).
    if (sessaoSemUnidade(sessao)) {
      encerrarSessao();
      router.replace("/login");
    }
  }, [hidratado, sessao, router, encerrarSessao]);

  if (!hidratado || !sessao || sessao.primeiroAcesso || sessaoSemUnidade(sessao)) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  return children;
}
