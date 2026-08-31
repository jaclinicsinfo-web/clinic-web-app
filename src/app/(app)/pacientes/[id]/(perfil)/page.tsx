import type { Metadata } from "next";

import { PacienteVisaoGeral } from "@/components/pacientes/paciente-visao-geral";

export const metadata: Metadata = {
  title: "Paciente",
};

export default function PacienteVisaoGeralPage() {
  return <PacienteVisaoGeral />;
}
