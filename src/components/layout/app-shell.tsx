"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { GuardaModulo } from "@/components/auth/guarda-modulo";
import { PlanoBanner } from "@/components/layout/plano-banner";
import { PlanoSync } from "@/components/layout/plano-sync";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useSessaoStore } from "@/hooks/use-sessao";
import { Loader2 } from "lucide-react";

function MenuMobile({ onClose }: { onClose: () => void }) {
  const [montado, setMontado] = React.useState(false);

  React.useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) return null;

  // Duas camadas fixed irmãs, no body: no iPad o Safari entrega o toque
  // para o overlay de tela cheia mesmo quando o menu está por cima no z-index.
  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 xl:hidden"
        onClick={onClose}
        aria-label="Fechar menu"
      />
      <div className="fixed inset-y-0 left-0 z-50 h-full w-64 touch-manipulation shadow-xl xl:hidden">
        <Sidebar collapsed={false} onToggleCollapse={onClose} onNavigate={onClose} />
      </div>
    </>,
    document.body,
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden overflow-x-clip bg-background">
      <PlanoSync />
      <div className="hidden h-full min-h-0 shrink-0 xl:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} />
      </div>

      {mobileOpen && <MenuMobile onClose={() => setMobileOpen(false)} />}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overflow-x-clip">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <PlanoBanner />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overflow-x-clip">
          <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-[1600px] flex-1 flex-col overflow-hidden overflow-x-clip px-3 py-3 pb-5 sm:p-4 sm:pb-6 lg:p-6">
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
