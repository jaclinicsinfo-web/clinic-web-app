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
    if (hidratado && !sessao) {
      router.replace("/login");
    }
  }, [hidratado, sessao, router]);

  if (!hidratado || !sessao) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  return children;
}
