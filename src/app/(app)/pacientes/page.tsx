import type { Metadata } from "next";

import { PacientesWorkspace } from "@/components/pacientes/pacientes-workspace";

export const metadata: Metadata = {
  title: "Pacientes",
};

export default function PacientesPage() {
  return <PacientesWorkspace />;
}
