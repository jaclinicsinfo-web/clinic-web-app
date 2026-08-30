import { ConfiguracoesTabs } from "@/components/configuracoes/configuracoes-tabs";

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <ConfiguracoesTabs />
      {children}
    </div>
  );
}
