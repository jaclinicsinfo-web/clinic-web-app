import type { Metadata } from "next";

import { PermissoesWorkspace } from "@/components/configuracoes/permissoes-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Perfis e permissões",
};

export default function PermissoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfis e permissões"
        description="Matriz de acesso por módulo: visualizar, criar, editar e desativar. As regras vêm do perfil real do usuário na clínica."
      />
      <PermissoesWorkspace />
    </div>
  );
}
