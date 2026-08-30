import type { Metadata } from "next";

import { RelatoriosWorkspace } from "@/components/relatorios/relatorios-workspace";
import { getRelatorios, type PeriodoRelatorio } from "@/services/relatorios";

export const metadata: Metadata = {
  title: "Relatórios",
};

const periodosValidos: PeriodoRelatorio[] = ["mes", "anterior", "30d", "12m", "ano"];

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; tipo?: string }>;
}) {
  const params = await searchParams;
  const periodo = periodosValidos.includes(params.periodo as PeriodoRelatorio)
    ? (params.periodo as PeriodoRelatorio)
    : "mes";

  return <RelatoriosWorkspace dados={getRelatorios(periodo)} periodo={periodo} tipo={params.tipo ?? "faturamento"} />;
}
