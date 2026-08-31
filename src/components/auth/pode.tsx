"use client";

import type { ReactNode } from "react";

import { useSessaoStore } from "@/hooks/use-sessao";
import { temPermissao } from "@/lib/permissoes";
import type { AcaoPermissao, ModuloSistema } from "@/types";

export function Pode({
  modulo,
  acao = "visualizar",
  children,
  fallback = null,
}: {
  modulo: ModuloSistema;
  acao?: AcaoPermissao;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  if (!temPermissao(permissoes, modulo, acao)) return fallback;
  return children;
}
