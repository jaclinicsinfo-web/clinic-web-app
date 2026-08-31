import type { Metadata } from "next";

import { ClinicaWorkspace } from "@/components/configuracoes/clinica-workspace";

export const metadata: Metadata = {
  title: "Dados da clínica",
};

export default function ClinicaPage() {
  return <ClinicaWorkspace />;
}
