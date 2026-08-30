import type { Metadata } from "next";

import { PermissoesMatrix } from "@/components/configuracoes/permissoes-matrix";
import { PageHeader } from "@/components/shared/page-header";
import { listPerfisAcesso } from "@/services/configuracoes";

export const metadata: Metadata = {
  title: "Perfis e permissões",
};

export default function PermissoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfis e permissões"
        description="Matriz de acesso por módulo: visualizar, criar, editar e excluir. Perfis customizados podem ser criados a partir dos padrões do sistema."
      />
      <PermissoesMatrix perfis={listPerfisAcesso()} />
    </div>
  );
}
