import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Número de colunas do grid em telas médias para cima. */
  columns?: 1 | 2 | 3;
  className?: string;
}

const columnClasses = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
};

export function FormSection({ title, description, children, columns = 2, className }: FormSectionProps) {
  return (
    <section className={cn("min-w-0 border-b border-border pb-6 last:border-0 last:pb-0", className)}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div
        className={cn(
          "grid auto-rows-min grid-cols-1 content-start items-start gap-4",
          columnClasses[columns],
        )}
      >
        {children}
      </div>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Ocupa todas as colunas do grid. */
  full?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, error, hint, required, full, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", full && "col-span-full", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
