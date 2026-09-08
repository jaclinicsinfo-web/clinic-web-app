"use client";

import { Sparkles } from "lucide-react";

import { useSessaoStore } from "@/hooks/use-sessao";
import { planoEstaAcimaDoTeto } from "@/lib/plano";
import { cn } from "@/lib/utils";

interface PlanoAtualIndicadorProps {
  className?: string;
}

export function PlanoAtualIndicador({ className }: PlanoAtualIndicadorProps) {
  const sessao = useSessaoStore((state) => state.sessao);
  if (!sessao?.plano) return null;

  const acima = planoEstaAcimaDoTeto(sessao.usoUsuarios);
  const descricao = `Plano ${sessao.plano.nome}`;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        acima
          ? "border-warning/30 bg-warning-bg text-warning"
          : "border-primary/20 bg-primary-subtle text-accent-foreground",
        className,
      )}
      title={descricao}
      aria-label={descricao}
    >
      <Sparkles className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">Plano {sessao.plano.nome}</span>
    </span>
  );
}
