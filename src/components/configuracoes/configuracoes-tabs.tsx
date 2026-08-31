"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSessaoStore } from "@/hooks/use-sessao";
import { isAdministrador } from "@/lib/plano";
import { cn } from "@/lib/utils";

const abas = [
  { label: "Dados da clínica", href: "/configuracoes/clinica" },
  { label: "Usuários", href: "/configuracoes/usuarios", admin: true },
  { label: "Perfis e permissões", href: "/configuracoes/permissoes", admin: true },
  { label: "Procedimentos", href: "/configuracoes/procedimentos" },
  { label: "Pagamentos", href: "/configuracoes/pagamentos" },
];

export function ConfiguracoesTabs() {
  const pathname = usePathname();
  const perfil = useSessaoStore((state) => state.sessao?.perfil);
  const admin = isAdministrador(perfil);
  const visiveis = abas.filter((aba) => !aba.admin || admin);

  return (
    <nav
      aria-label="Seções de configurações"
      className="flex w-full items-center gap-1 overflow-x-auto border-b border-border scrollbar-thin"
    >
      {visiveis.map((aba) => {
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
