import type { Metadata } from "next";

import { PacienteFinanceiro } from "@/components/pacientes/paciente-financeiro";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function FinanceiroPacientePage() {
  return <PacienteFinanceiro />;
}
