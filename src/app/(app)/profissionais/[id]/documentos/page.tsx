import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfissionalDocumentos } from "@/components/profissionais/profissional-documentos";
import { getProfissionalById } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profissional = getProfissionalById(id);
  return { title: profissional ? `Documentos de ${profissional.nome}` : "Documentos" };
}

export default async function ProfissionalDocumentosPage({ params }: PageProps) {
  const { id } = await params;
  const profissional = getProfissionalById(id);

  if (!profissional) notFound();

  return <ProfissionalDocumentos profissionalNome={profissional.nome} />;
}
