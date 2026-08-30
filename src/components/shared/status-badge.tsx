import { Badge } from "@/components/ui/badge";
import { getStatusMeta, type StatusDomain } from "@/lib/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  domain: StatusDomain;
  status: string;
  withDot?: boolean;
  className?: string;
}

const dotTone: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-neutral",
};

export function StatusBadge({ domain, status, withDot = true, className }: StatusBadgeProps) {
  const { label, tone } = getStatusMeta(domain, status);

  return (
    <Badge tone={tone} className={className}>
      {withDot && <span className={cn("size-1.5 rounded-full", dotTone[tone])} aria-hidden />}
      {label}
    </Badge>
  );
}
