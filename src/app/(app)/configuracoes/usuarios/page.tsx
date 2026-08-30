import type { Metadata } from "next";

import { UsuariosWorkspace } from "@/components/configuracoes/usuarios-workspace";

export const metadata: Metadata = {
  title: "Usuários",
};

export default function UsuariosPage() {
  return <UsuariosWorkspace />;
}
