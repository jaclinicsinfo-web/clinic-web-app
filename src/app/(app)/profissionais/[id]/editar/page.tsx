import type { Metadata } from "next";

import { ProfissionalFormWorkspace } from "@/components/profissionais/profissional-form-workspace";

export const metadata: Metadata = {
  title: "Editar profissional",
};

export default async function EditarProfissionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfissionalFormWorkspace profissionalId={id} />;
}
