import type { Metadata } from "next";

import { UsuariosTable } from "@/components/configuracoes/usuarios-table";
import { PageHeader } from "@/components/shared/page-header";
import { listPerfisAcesso, listUnidades, listUsuarios } from "@/services/configuracoes";

export const metadata: Metadata = {
  title: "Usuários",
};

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Quem acessa o painel, com perfil RBAC e unidades liberadas."
      />
      <UsuariosTable usuarios={listUsuarios()} perfis={listPerfisAcesso()} unidades={listUnidades()} />
    </div>
  );
}
