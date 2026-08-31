"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { segmentLabels } from "@/lib/navigation";
import { useEntidadeLabelsStore } from "@/hooks/use-entidade-labels";

/** Resolve rótulos de segmentos dinâmicos ([id]) para o nome da entidade. */
function resolveDynamicLabel(
  segments: string[],
  index: number,
  nomes: { pacientes: Record<string, string>; profissionais: Record<string, string>; convenios: Record<string, string> },
) {
  const segment = segments[index];
  const parent = segments[index - 1];

  if (parent === "pacientes") return nomes.pacientes[segment];
  if (parent === "profissionais") return nomes.profissionais[segment];
  if (parent === "convenios") return nomes.convenios[segment];
  return undefined;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const nomes = useEntidadeLabelsStore();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segmentLabels[segment] ?? resolveDynamicLabel(segments, index, nomes) ?? segment;
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
