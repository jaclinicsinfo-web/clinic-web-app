import type { Metadata } from "next";

import { ClinicaForm } from "@/components/configuracoes/clinica-form";
import { clinica } from "@/services/configuracoes";

export const metadata: Metadata = {
  title: "Dados da clínica",
};

export default function ClinicaPage() {
  return <ClinicaForm clinica={clinica} />;
}
