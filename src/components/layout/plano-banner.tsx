"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSessaoStore } from "@/hooks/use-sessao";
import { excedenteUsuarios, isAdministrador, rotuloUso } from "@/lib/plano";
import { cn } from "@/lib/utils";

export function PlanoBanner() {
  const sessao = useSessaoStore((state) => state.sessao);
  const dispensarAvisoUpgrade = useSessaoStore((state) => state.dispensarAvisoUpgrade);

  if (!sessao?.planoEvento || !sessao.plano) return null;

  const admin = isAdministrador(sessao.perfil);
  const excedente = excedenteUsuarios(sessao.usoUsuarios);

  if (sessao.planoEvento === "upgrade") {
    return (
      <div className="border-b border-success/20 bg-success-bg px-4 py-2.5 lg:px-6">
        <div className="mx-auto flex max-w-[1600px] items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <p className="min-w-0 flex-1 text-sm text-success">
            Plano atualizado para <span className="font-semibold">{sessao.plano.nome}</span>.{" "}
            {rotuloUso(sessao.usoUsuarios)}.
          </p>
          <button
            type="button"
            onClick={dispensarAvisoUpgrade}
            className="rounded-md p-1 text-success/70 transition-colors hover:bg-success/10 hover:text-success"
            aria-label="Dispensar aviso"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border-b border-warning/25 bg-warning-bg px-4 py-2.5 lg:px-6")}>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 text-sm text-warning">
          O plano foi reduzido para <span className="font-semibold">{sessao.plano.nome}</span>
          {sessao.usoUsuarios?.limite != null ? ` (até ${sessao.usoUsuarios.limite} usuários)` : ""}. Há{" "}
          <span className="font-semibold">
            {excedente} conta{excedente === 1 ? "" : "s"} acima do limite
          </span>
          . {admin ? "Inative o excesso para voltar a criar usuários." : "Peça ao administrador para inativar contas extras."}
        </p>
        {admin && (
          <Button asChild size="sm" variant="outline" className="shrink-0 border-warning/40 bg-card">
            <Link href="/configuracoes/usuarios">
              Gerenciar usuários
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
