"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSessaoStore } from "@/hooks/use-sessao";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hidratado = useSessaoStore((state) => state.hidratado);
  const sessao = useSessaoStore((state) => state.sessao);

  React.useEffect(() => {
    if (!hidratado) return;
    if (!sessao) {
      router.replace("/login");
      return;
    }
    if (sessao.primeiroAcesso) {
      router.replace("/primeiro-acesso");
    }
  }, [hidratado, sessao, router]);

  if (!hidratado || !sessao || sessao.primeiroAcesso) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  return children;
}
