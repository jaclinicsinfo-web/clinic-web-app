import type { Metadata } from "next";

import { ProfissionaisWorkspace } from "@/components/profissionais/profissionais-workspace";

export const metadata: Metadata = {
  title: "Profissionais",
};

export default function ProfissionaisPage() {
  return <ProfissionaisWorkspace />;
}
