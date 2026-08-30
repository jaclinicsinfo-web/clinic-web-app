import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfissionalComissoesTable } from "@/components/profissionais/profissional-comissoes-table";
import { getComissoesDoProfissional, getProfissionalById } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profissional = getProfissionalById(id);
  return { title: profissional ? `Comissões de ${profissional.nome}` : "Comissões" };
}

export default async function ProfissionalComissoesPage({ params }: PageProps) {
  const { id } = await params;
  const profissional = getProfissionalById(id);

  if (!profissional) notFound();

  return <ProfissionalComissoesTable comissoes={getComissoesDoProfissional(id)} />;
}
