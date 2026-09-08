import { cn } from "@/lib/utils";

interface FormPageProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Página de formulário: o chrome fica fixo e só os campos rolam. */
export function FormPage({ header, footer, children, className, contentClassName }: FormPageProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-4 overflow-hidden", className)}>
      {header ? <div className="shrink-0">{header}</div> : null}
      <div
        className={cn(
          "min-h-0 flex-1 overscroll-contain",
          contentClassName ?? "overflow-x-hidden overflow-y-auto scrollbar-thin",
        )}
      >
        {children}
      </div>
      {footer ? <div className="shrink-0">{footer}</div> : null}
    </div>
  );
}
