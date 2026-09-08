import { ConfiguracoesTabs } from "@/components/configuracoes/configuracoes-tabs";

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      <div className="shrink-0">
        <ConfiguracoesTabs />
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-thin">
        {children}
      </div>
    </div>
  );
}
