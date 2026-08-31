"use client";

import { useProfissionalPerfil } from "@/components/profissionais/profissional-perfil-shell";
import { ProfissionalComissoesTable } from "@/components/profissionais/profissional-comissoes-table";

export default function ProfissionalComissoesPage() {
  const { comissoes } = useProfissionalPerfil();
  return <ProfissionalComissoesTable comissoes={comissoes} />;
}
