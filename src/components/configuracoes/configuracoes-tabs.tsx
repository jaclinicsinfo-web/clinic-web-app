"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSessaoStore } from "@/hooks/use-sessao";
import { temPermissao } from "@/lib/permissoes";
import { isAdministrador, isAdminOuGestor } from "@/lib/plano";
import { cn } from "@/lib/utils";

const abas: { label: string; href: string; visivel?: "admin" | "adminOuGestor" }[] = [
  { label: "Dados da clínica", href: "/configuracoes/clinica" },
  { label: "Usuários", href: "/configuracoes/usuarios", visivel: "adminOuGestor" },
  { label: "Perfis e permissões", href: "/configuracoes/permissoes", visivel: "admin" },
  { label: "Procedimentos", href: "/configuracoes/procedimentos" },
  { label: "Pagamentos", href: "/configuracoes/pagamentos" },
];

export function ConfiguracoesTabs() {
  const pathname = usePathname();
  const sessao = useSessaoStore((state) => state.sessao);
  const perfil = sessao?.perfil;
  const admin = isAdministrador(perfil);
  const adminOuGestor = isAdminOuGestor(perfil);
  const podeConfig = temPermissao(sessao?.permissoes, "configuracoes");
  const visiveis = abas.filter((aba) => {
    if (aba.visivel === "admin") return admin;
    if (aba.visivel === "adminOuGestor") return adminOuGestor;
    return podeConfig;
  });

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
