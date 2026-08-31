"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSessaoStore } from "@/hooks/use-sessao";
import { podeAcessarRota, primeiraRotaPermitida } from "@/lib/permissoes";

export function GuardaModulo({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sessao = useSessaoStore((state) => state.sessao);
  const permitido = podeAcessarRota(pathname, sessao?.permissoes, sessao?.perfil);

  React.useEffect(() => {
    if (!sessao || sessao.permissoes === null) return;
    if (!permitido) {
      router.replace(primeiraRotaPermitida(sessao.permissoes));
    }
  }, [permitido, router, sessao]);

  if (!sessao || sessao.permissoes === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando permissões" />
      </div>
    );
  }

  if (!permitido) return null;

  return children;
}
