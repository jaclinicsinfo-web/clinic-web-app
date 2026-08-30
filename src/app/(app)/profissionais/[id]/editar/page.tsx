import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ProfissionalForm } from "@/components/profissionais/profissional-form";
import { especialidades, listProcedimentos } from "@/services/catalogo";
import { getProfissionalById } from "@/services/profissionais";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profissional = getProfissionalById(id);
  return { title: profissional ? `Editar ${profissional.nome}` : "Profissional não encontrado" };
}

export default async function EditarProfissionalPage({ params }: PageProps) {
  const { id } = await params;
  const profissional = getProfissionalById(id);

  if (!profissional) notFound();

  const procedimentos = listProcedimentos()
    .filter((procedimento) => procedimento.status === "ativo")
    .map(({ id: procedimentoId, nome, categoria, duracaoPadraoMin, valorParticular }) => ({
      id: procedimentoId,
      nome,
      categoria,
      duracaoPadraoMin,
      valorParticular,
    }));

  return (
    <div className="space-y-6">
      <PageHeader title="Editar profissional" description={profissional.nome} />
      <ProfissionalForm especialidades={[...especialidades]} procedimentos={procedimentos} />
    </div>
  );
}
