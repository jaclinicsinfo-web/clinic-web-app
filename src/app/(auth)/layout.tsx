import { HeartPulse } from "lucide-react";

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
          <span className="flex size-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-black/20">
            <HeartPulse className="size-10" />
          </span>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white">J.A. Clinics</h1>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-sidebar-muted">{FEATURES.join(" · ")}</p>
        </div>
      </aside>

      <main className="flex w-full items-center justify-center overflow-y-auto bg-card px-6 py-12 lg:w-[52%]">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center text-center lg:hidden">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <HeartPulse className="size-7" />
            </span>
            <p className="mt-4 text-xl font-semibold tracking-tight text-foreground">J.A. Clinics</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
