"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { GuardaModulo } from "@/components/auth/guarda-modulo";
import { PlanoBanner } from "@/components/layout/plano-banner";
import { PlanoSync } from "@/components/layout/plano-sync";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useSessaoStore } from "@/hooks/use-sessao";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <PlanoSync />
      <div className="hidden h-full min-h-0 shrink-0 lg:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />
          <div className="relative z-10 h-full max-h-full">
            <Sidebar collapsed={false} onToggleCollapse={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <PlanoBanner />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden p-4 pb-6 lg:p-6">
            {permissoes === null ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando permissões" />
              </div>
            ) : (
              <GuardaModulo>{children}</GuardaModulo>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
