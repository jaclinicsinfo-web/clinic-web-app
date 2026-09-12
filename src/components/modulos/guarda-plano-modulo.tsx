"use client";

import { ModuloReservado } from "@/components/modulos/modulo-reservado";
import { useSessaoStore } from "@/hooks/use-sessao";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import type { ModuloSistema } from "@/types";

export function GuardaPlanoModulo({
  modulo,
  titulo,
  descricao,
  itens,
  children,
}: {
  modulo: ModuloSistema;
  titulo: string;
  descricao: string;
  itens: string[];
  children: React.ReactNode;
}) {
  const plano = useSessaoStore((state) => state.sessao?.plano);

  if (!planoIncluiModulo(plano, modulo)) {
    return <ModuloReservado titulo={titulo} descricao={descricao} modulo={modulo} itens={itens} />;
  }

  return children;
}
