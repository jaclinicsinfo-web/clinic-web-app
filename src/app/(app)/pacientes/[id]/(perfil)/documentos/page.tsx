import type { Metadata } from "next";

import { PacienteDocumentos } from "@/components/pacientes/paciente-documentos";

export const metadata: Metadata = {
  title: "Documentos",
};

export default function DocumentosPage() {
  return <PacienteDocumentos />;
}
