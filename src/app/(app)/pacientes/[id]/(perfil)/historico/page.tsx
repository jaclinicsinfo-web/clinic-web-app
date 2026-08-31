import type { Metadata } from "next";

import { PacienteHistorico } from "@/components/pacientes/paciente-historico";

export const metadata: Metadata = {
  title: "Histórico",
};

export default function HistoricoPage() {
  return <PacienteHistorico />;
}
