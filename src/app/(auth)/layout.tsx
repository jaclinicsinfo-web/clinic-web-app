import { HeartPulse } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-sidebar p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-primary/40 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold text-white">ClinicERP</p>
            <p className="text-xs text-sidebar-muted">Clínica Vida Integrada</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Toda a operação da clínica em um só lugar.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-muted">
            Agenda, prontuário, faturamento de convênios e financeiro integrados — com indicadores em tempo real para
            apoiar as decisões da gestão.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-6">
            {[
              { valor: "9 módulos", descricao: "Do agendamento ao relatório gerencial" },
              { valor: "Multi-unidade", descricao: "Contexto por filial em um clique" },
              { valor: "RBAC", descricao: "Permissões por módulo e por ação" },
              { valor: "LGPD", descricao: "Consentimento e trilha de acesso" },
            ].map((item) => (
              <div key={item.valor}>
                <dt className="text-sm font-semibold text-white">{item.valor}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-sidebar-muted">{item.descricao}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-xs text-sidebar-muted">
          Acesso restrito à equipe da clínica. Não há acesso de pacientes neste sistema.
        </p>
      </aside>

      <main className="flex w-full items-center justify-center bg-card px-6 py-12 lg:w-[52%]">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">ClinicERP</p>
              <p className="text-xs text-muted-foreground">Gestão de clínicas</p>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
