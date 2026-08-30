"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const abas = [
  { label: "Dados da clínica", href: "/configuracoes/clinica" },
  { label: "Usuários", href: "/configuracoes/usuarios" },
  { label: "Perfis e permissões", href: "/configuracoes/permissoes" },
  { label: "Procedimentos", href: "/configuracoes/procedimentos" },
  { label: "Pagamentos", href: "/configuracoes/pagamentos" },
  { label: "Mensagens", href: "/configuracoes/mensagens" },
  { label: "Integrações", href: "/configuracoes/integracoes" },
];

export function ConfiguracoesTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Seções de configurações"
      className="flex w-full items-center gap-1 overflow-x-auto border-b border-border scrollbar-thin"
    >
      {abas.map((aba) => {
        const ativa = pathname === aba.href;
        return (
          <Link
            key={aba.href}
            href={aba.href}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              ativa
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
