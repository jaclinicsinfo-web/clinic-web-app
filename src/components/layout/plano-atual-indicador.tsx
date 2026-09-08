"use client";

import { Sparkles } from "lucide-react";

import { useSessaoStore } from "@/hooks/use-sessao";
import { planoEstaAcimaDoTeto, rotuloUso } from "@/lib/plano";
import { cn } from "@/lib/utils";

interface PlanoAtualIndicadorProps {
  className?: string;
}

export function PlanoAtualIndicador({ className }: PlanoAtualIndicadorProps) {
  const sessao = useSessaoStore((state) => state.sessao);
  if (!sessao?.plano) return null;

  const acima = planoEstaAcimaDoTeto(sessao.usoUsuarios);
  const uso = rotuloUso(sessao.usoUsuarios);
  const descricao = uso ? `Plano ${sessao.plano.nome}. ${uso}.` : `Plano ${sessao.plano.nome}`;

  return (
    <span
      className={cn(
        "inline-flex w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        acima
          ? "border-warning/30 bg-warning-bg text-warning"
          : "border-primary/20 bg-primary-subtle text-accent-foreground",
        className,
      )}
      title={descricao}
      aria-label={descricao}
    >
      <Sparkles className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 truncate">
        Plano {sessao.plano.nome}
        {uso ? <span className="font-normal opacity-80"> · {uso}</span> : null}
      </span>
    </span>
  );
}
