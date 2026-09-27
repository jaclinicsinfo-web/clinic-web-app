import { BrandLogo } from "@/components/brand/brand-logo";

const FEATURES = ["Agenda", "Prontuário", "Financeiro", "Convênios", "Multi-unidade", "RBAC", "LGPD"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0">
      <aside className="relative hidden w-[48%] flex-col items-center justify-center overflow-hidden bg-sidebar px-12 py-16 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-primary/40 blur-3xl"
        />

        <div className="relative flex flex-col items-center text-center">
          <BrandLogo variant="compact" onDark priority className="w-[min(16rem,70%)]" />
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-sidebar-muted">{FEATURES.join(" · ")}</p>
        </div>
      </aside>

      <main className="flex w-full items-center justify-center overflow-y-auto bg-card px-6 py-12 lg:w-[52%]">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center text-center lg:hidden">
            <BrandLogo variant="compact" priority className="w-36" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
