import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { PacienteForm } from "@/components/pacientes/paciente-form";
import { listConvenios } from "@/services/catalogo";
import { listProfissionais } from "@/services/profissionais";

export const metadata: Metadata = {
  title: "Novo paciente",
};

export default function NovoPacientePage() {
  const convenios = listConvenios()
    .filter((convenio) => convenio.status === "ativo")
    .map(({ id, nome }) => ({ id, nome }));

  const profissionais = listProfissionais()
    .filter((profissional) => profissional.status === "ativo")
    .map(({ id, nome }) => ({ id, nome }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Novo paciente"
        description="Preencha os dados cadastrais, clínicos e os consentimentos exigidos pela LGPD."
      />
      <PacienteForm convenios={convenios} profissionais={profissionais} />
    </div>
  );
}
