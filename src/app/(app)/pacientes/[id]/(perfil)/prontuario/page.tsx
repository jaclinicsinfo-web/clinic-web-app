import type { Metadata } from "next";

import { PacienteProntuario } from "@/components/pacientes/paciente-prontuario";

export const metadata: Metadata = {
  title: "Acompanhamento",
};

export default function ProntuarioPage() {
  return <PacienteProntuario />;
}
