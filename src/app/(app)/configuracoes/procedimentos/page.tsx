import type { Metadata } from "next";

import { ProcedimentosTable } from "@/components/configuracoes/procedimentos-table";
import { PageHeader } from "@/components/shared/page-header";
import { categoriasProcedimento, listProcedimentos } from "@/services/catalogo";

export const metadata: Metadata = {
  title: "Procedimentos",
};

export default function ProcedimentosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Procedimentos"
        description="Serviços oferecidos pela clínica: duração padrão, valor particular e vínculo com a agenda."
      />
      <ProcedimentosTable procedimentos={listProcedimentos()} categorias={categoriasProcedimento} />
    </div>
  );
}
