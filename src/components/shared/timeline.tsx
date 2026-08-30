import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  meta?: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
  footer?: React.ReactNode;
}

const toneClasses = {
  primary: "bg-primary-subtle text-primary",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  neutral: "bg-muted text-muted-foreground",
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-6", className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-4 pl-0">
            {!isLast && <span className="absolute left-4 top-9 h-[calc(100%+0.5rem)] w-px bg-border" aria-hidden />}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                toneClasses[item.tone ?? "primary"],
              )}
            >
              {Icon ? <Icon className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.meta && <span className="text-xs text-muted-foreground">{item.meta}</span>}
              </div>
              {item.description && <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>}
              {item.footer && <div className="mt-2">{item.footer}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
