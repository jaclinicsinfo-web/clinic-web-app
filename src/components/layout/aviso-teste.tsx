"use client";

import { Clock3 } from "lucide-react";

import { detalhesValidadeTeste } from "@/lib/acesso-gratuito";
import { useSessaoStore } from "@/hooks/use-sessao";

export function AvisoTeste() {
  const sessao = useSessaoStore((state) => state.sessao);
  const detalhes = detalhesValidadeTeste(sessao?.acessoGratuito?.expiraEm, sessao?.plano?.nome);
  if (!detalhes) return null;

  const texto = `Acesso teste${detalhes.plano ? ` do plano ${detalhes.plano}` : ""}, válido até ${detalhes.data}.`;

  return (
    <span
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 text-xs font-medium text-orange-800 dark:border-orange-400/30 dark:bg-orange-500/15 dark:text-orange-200"
      title={texto}
      aria-label={texto}
    >
      <Clock3 className="size-3.5 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">
        Acesso teste
        {detalhes.plano ? ` · plano: ${detalhes.plano}` : ""} · até {detalhes.data}
      </span>
    </span>
  );
}
