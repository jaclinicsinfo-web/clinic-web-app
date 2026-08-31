"use client";

import { useProfissionalPerfil } from "@/components/profissionais/profissional-perfil-shell";
import { ProfissionalPacientesTable } from "@/components/profissionais/profissional-pacientes-table";

export default function ProfissionalPacientesPage() {
  const { pacientesAtendidos } = useProfissionalPerfil();
  return (
    <ProfissionalPacientesTable
      pacientes={pacientesAtendidos.map((item) => ({
        id: item.id,
        nome: item.nome,
        telefone: item.telefone,
        convenio: item.convenio,
        status: item.status as "ativo" | "inativo" | "arquivado",
        atendimentos: item.atendimentos,
        ultimaVisita: item.ultimaVisita ?? undefined,
      }))}
    />
  );
}
