"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { useSessaoStore } from "@/hooks/use-sessao";
import { avisoDeCobranca } from "@/lib/assinatura";
import { isAdministrador } from "@/lib/plano";
import { cn } from "@/lib/utils";
import { obterAssinaturaApi, type AssinaturaClinica } from "@/services/assinatura";

/** Avisa vencimento próximo e pagamento atrasado (carência de 5 dias) no topo do sistema. */
export function AvisoCobranca() {
  const pathname = usePathname();
  const sessao = useSessaoStore((state) => state.sessao);
  const clinicaId = sessao?.clinicaId;
  const [assinatura, setAssinatura] = React.useState<AssinaturaClinica | null>(null);

  React.useEffect(() => {
    if (!clinicaId) return;
    let ativo = true;
    obterAssinaturaApi()
      .then((dados) => {
        if (ativo) setAssinatura(dados);
      })
      .catch(() => {
        // O aviso não deve atrapalhar a tela se a consulta falhar.
      });
    return () => {
      ativo = false;
    };
  }, [clinicaId, pathname]);

  const aviso = avisoDeCobranca(clinicaId ? assinatura : null);
  if (!aviso) return null;

  const admin = isAdministrador(sessao?.perfil);
  const titulo = admin ? `${aviso.longo} Clique para pagar.` : `${aviso.longo} Avise o administrador da clínica.`;
  const classe = cn(
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
    aviso.tom === "danger"
      ? "border-danger/30 bg-danger-bg text-danger"
      : "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-400/30 dark:bg-orange-500/15 dark:text-orange-200",
  );
  const conteudo = (
    <>
      <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
      <span className="hidden whitespace-nowrap sm:inline">{aviso.curto}</span>
      <span className="whitespace-nowrap sm:hidden">{aviso.tom === "danger" ? "Pagamento pendente" : "Vence em breve"}</span>
    </>
  );

  if (admin) {
    return (
      <Link href="/configuracoes/assinatura" className={cn(classe, "hover:opacity-90")} title={titulo} aria-label={titulo}>
        {conteudo}
      </Link>
    );
  }
  return (
    <span className={classe} title={titulo} aria-label={titulo}>
      {conteudo}
    </span>
  );
}
