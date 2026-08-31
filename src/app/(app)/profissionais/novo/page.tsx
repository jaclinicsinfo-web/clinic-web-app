import type { Metadata } from "next";

import { ProfissionalFormWorkspace } from "@/components/profissionais/profissional-form-workspace";

export const metadata: Metadata = {
  title: "Novo profissional",
};

export default function NovoProfissionalPage() {
  return <ProfissionalFormWorkspace />;
}
