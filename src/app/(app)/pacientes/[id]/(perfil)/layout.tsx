import type { ReactNode } from "react";

import { PacientePerfilShell } from "@/components/pacientes/paciente-perfil-shell";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function PacientePerfilLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  return <PacientePerfilShell pacienteId={id}>{children}</PacientePerfilShell>;
}
