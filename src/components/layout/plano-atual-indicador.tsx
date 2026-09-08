"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <Badge
      tone={acima ? "warning" : "primary"}
      className={cn("max-w-[11rem] shrink-0 sm:max-w-none", className)}
      title={descricao}
      aria-label={descricao}
    >
      <Sparkles className="size-3 shrink-0" aria-hidden />
      <span className="truncate">
        <span className="hidden sm:inline">Plano </span>
        {sessao.plano.nome}
      </span>
      {uso ? <span className="hidden font-normal opacity-80 xl:inline">· {uso}</span> : null}
    </Badge>
  );
}
