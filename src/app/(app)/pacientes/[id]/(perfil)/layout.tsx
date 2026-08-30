import { notFound } from "next/navigation";

import { EntityTabsNav } from "@/components/pacientes/paciente-tabs-nav";
import { PacienteHeader } from "@/components/pacientes/paciente-header";
import { getPacienteById } from "@/services/pacientes";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function PacientePerfilLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const paciente = getPacienteById(id);

  if (!paciente) notFound();

  const tabs = [
    { label: "Visão geral", href: `/pacientes/${id}` },
    { label: "Acompanhamento", href: `/pacientes/${id}/prontuario` },
    { label: "Histórico", href: `/pacientes/${id}/historico` },
    { label: "Documentos", href: `/pacientes/${id}/documentos` },
    { label: "Financeiro", href: `/pacientes/${id}/financeiro` },
  ];

  return (
    <div className="space-y-5">
      <PacienteHeader paciente={paciente} />
      <EntityTabsNav items={tabs} />
      <div>{children}</div>
    </div>
  );
}
