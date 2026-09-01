"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import { useSessaoStore } from "@/hooks/use-sessao";

const abas = [
  { label: "Visão geral", segmento: "" },
  { label: "Agenda", segmento: "agenda" },
  { label: "Pacientes", segmento: "pacientes" },
  { label: "Comissões", segmento: "comissoes" },
  { label: "Documentos", segmento: "documentos" },
];

export function ProfissionalTabs({ profissionalId }: { profissionalId: string }) {
  const pathname = usePathname();
  const plano = useSessaoStore((state) => state.sessao?.plano);
  const base = `/profissionais/${profissionalId}`;
  const visiveis = abas.filter((aba) => aba.segmento !== "comissoes" || planoIncluiModulo(plano, "financeiro"));

  return (
    <nav
      aria-label="Seções do profissional"
      className="flex w-full items-center gap-1 overflow-x-auto border-b border-border scrollbar-thin"
    >
      {visiveis.map((aba) => {
        const href = aba.segmento ? `${base}/${aba.segmento}` : base;
        const ativa = pathname === href;

        return (
          <Link
            key={aba.label}
            href={href}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              ativa && "border-primary text-primary",
            )}
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
