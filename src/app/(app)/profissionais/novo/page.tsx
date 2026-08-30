import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ProfissionalForm } from "@/components/profissionais/profissional-form";
import { Button } from "@/components/ui/button";
import { especialidades, listProcedimentos } from "@/services/catalogo";

export const metadata: Metadata = {
  title: "Novo profissional",
};

export default function NovoProfissionalPage() {
  const procedimentos = listProcedimentos()
    .filter((procedimento) => procedimento.status === "ativo")
    .map(({ id, nome, categoria, duracaoPadraoMin, valorParticular }) => ({
      id,
      nome,
      categoria,
      duracaoPadraoMin,
      valorParticular,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo profissional"
        description="Cadastre o profissional, o vínculo contratual e a disponibilidade na agenda."
        actions={
          <Button variant="outline" asChild>
            <Link href="/profissionais">
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
        }
      />

      <ProfissionalForm especialidades={[...especialidades]} procedimentos={procedimentos} />
    </div>
  );
}
