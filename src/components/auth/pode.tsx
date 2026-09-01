"use client";

import type { ReactNode } from "react";

import { useSessaoStore } from "@/hooks/use-sessao";
import { planoIncluiModulo } from "@/lib/modulos-plano";
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
  const sessao = useSessaoStore((state) => state.sessao);
  if (!planoIncluiModulo(sessao?.plano, modulo)) return fallback;
  if (!temPermissao(sessao?.permissoes, modulo, acao)) return fallback;
  return children;
}
