import type { Metadata } from "next";

import { PacienteFormWorkspace } from "@/components/pacientes/paciente-form-workspace";

export const metadata: Metadata = {
  title: "Novo paciente",
};

export default function NovoPacientePage() {
  return <PacienteFormWorkspace />;
}
