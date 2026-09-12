"use client";

import { BarChart3, Boxes, FileBarChart, Lock, MessageCircle, Sparkles, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useSessaoStore } from "@/hooks/use-sessao";
import { planoIncluiModulo, planoMinimoDoModulo } from "@/lib/modulos-plano";
import { nomeDoPlano } from "@/lib/plano";
import type { ModuloSistema } from "@/types";

const icones: Partial<Record<ModuloSistema, LucideIcon>> = {
  financeiro: Wallet,
  estoque: Boxes,
  relatorios: FileBarChart,
  integracoes: MessageCircle,
  powerbi: BarChart3,
  agenteia: Sparkles,
};

export function ModuloReservado({
  titulo,
  descricao,
  modulo,
  itens,
}: {
  titulo: string;
  descricao: string;
  modulo: ModuloSistema;
  itens: string[];
}) {
  const plano = useSessaoStore((state) => state.sessao?.plano);
  const liberado = planoIncluiModulo(plano, modulo);
  const planoMinimo = nomeDoPlano(planoMinimoDoModulo(modulo));
  const Icon = icones[modulo] ?? Sparkles;

  return (
    <div className="space-y-6">
      <PageHeader title={titulo} description={descricao} />

      <Card>
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {liberado ? <Icon className="size-5" /> : <Lock className="size-5" />}
          </span>
          <h2 className="mt-4 text-sm font-semibold text-foreground">
            {liberado ? "Em breve neste plano" : `Disponível no plano ${planoMinimo}`}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {liberado
              ? "Esta área já está liberada no seu plano. A implementação entra nas próximas entregas."
              : `O plano ${plano?.nome ?? "atual"} não inclui este módulo. Faça upgrade para ${planoMinimo} para liberar o acesso.`}
          </p>

          <ul className="mt-6 w-full max-w-sm space-y-2 text-left text-sm text-muted-foreground">
            {itens.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
