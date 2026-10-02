import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Variação percentual em relação ao período anterior. */
  variation?: number;
  variationLabel?: string;
  hint?: string;
  /** Quando true, uma variação positiva é ruim (ex.: taxa de faltas). */
  invertVariation?: boolean;
  valueClassName?: string;
  iconClassName?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variation,
  variationLabel = "vs. período anterior",
  hint,
  invertVariation = false,
  valueClassName,
  iconClassName,
  className,
}: StatCardProps) {
  const hasVariation = typeof variation === "number";
  const isNeutral = hasVariation && Math.abs(variation) < 0.05;
  const isGood = hasVariation && (invertVariation ? variation < 0 : variation > 0);
  const VariationIcon = isNeutral ? Minus : variation && variation > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary",
              iconClassName,
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>

      <p className={cn("mt-3 text-2xl font-semibold tracking-tight text-foreground", valueClassName)}>{value}</p>

      {hasVariation ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              isNeutral ? "text-muted-foreground" : isGood ? "text-success" : "text-danger",
            )}
          >
            <VariationIcon className="size-3.5" />
            {Math.abs(variation).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </span>
          <span className="text-muted-foreground">{variationLabel}</span>
        </div>
      ) : (
        hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      )}
    </Card>
  );
}
