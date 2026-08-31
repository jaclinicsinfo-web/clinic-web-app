"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { segmentLabels } from "@/lib/navigation";
import { getPacienteById } from "@/services/pacientes";
import { getProfissionalById } from "@/services/profissionais";
import { getConvenioById } from "@/services/catalogo";

/** Resolve rótulos de segmentos dinâmicos ([id]) para o nome da entidade. */
function resolveDynamicLabel(segments: string[], index: number) {
  const segment = segments[index];
  const parent = segments[index - 1];

  if (parent === "pacientes") return getPacienteById(segment)?.nome;
  if (parent === "profissionais") return getProfissionalById(segment)?.nome;
  if (parent === "convenios") return getConvenioById(segment)?.nome;
  return undefined;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segmentLabels[segment] ?? resolveDynamicLabel(segments, index) ?? segment;
    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <nav aria-label="Trilha de navegação" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/dashboard" className="flex items-center transition-colors hover:text-foreground" aria-label="Início">
        <Home className="size-4" />
      </Link>

      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 shrink-0 opacity-60" />
          {crumb.isLast ? (
            <span className="max-w-52 truncate font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="max-w-40 truncate transition-colors hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
