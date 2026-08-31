"use client";

import { useProfissionalPerfil } from "@/components/profissionais/profissional-perfil-shell";
import { ProfissionalAgenda } from "@/components/profissionais/profissional-agenda";

export default function ProfissionalAgendaPage() {
  const { agenda } = useProfissionalPerfil();
  return <ProfissionalAgenda agendamentos={agenda} />;
}
