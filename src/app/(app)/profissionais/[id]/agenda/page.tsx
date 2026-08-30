import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfissionalAgenda } from "@/components/profissionais/profissional-agenda";
import { getAgendaDoProfissional, getProfissionalById } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profissional = getProfissionalById(id);
  return { title: profissional ? `Agenda de ${profissional.nome}` : "Agenda" };
}

export default async function ProfissionalAgendaPage({ params }: PageProps) {
  const { id } = await params;
  const profissional = getProfissionalById(id);

  if (!profissional) notFound();

  return <ProfissionalAgenda agendamentos={getAgendaDoProfissional(id)} />;
}
