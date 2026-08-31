"use client";

import * as React from "react";

import { ProcedimentosTable } from "@/components/configuracoes/procedimentos-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ApiError } from "@/lib/api";
import { listarProcedimentosApi } from "@/services/procedimentos";
import type { Procedimento } from "@/types";

export function ProcedimentosWorkspace() {
  const [procedimentos, setProcedimentos] = React.useState<Procedimento[]>([]);
  const [categorias, setCategorias] = React.useState<string[]>([]);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    void listarProcedimentosApi()
      .then((data) => {
        setProcedimentos(data.procedimentos);
        setCategorias(data.categorias);
      })
      .catch((error) => {
        setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os procedimentos.");
      });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procedimentos"
        description="Serviços oferecidos pela clínica: duração padrão, valor particular e vínculo com a agenda."
      />
      {erro ? (
        <EmptyState title="Não foi possível carregar" description={erro} />
      ) : (
        <ProcedimentosTable procedimentos={procedimentos} categorias={categorias} />
      )}
    </div>
  );
}
