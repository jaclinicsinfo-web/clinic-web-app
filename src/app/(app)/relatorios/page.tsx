import type { Metadata } from "next";

import { RelatoriosWorkspace } from "@/components/relatorios/relatorios-workspace";
import { type PeriodoRelatorio, periodosRelatorio } from "@/services/relatorios";

export const metadata: Metadata = {
  title: "Relatórios",
};

const periodosValidos = periodosRelatorio.map((item) => item.id);

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; tipo?: string }>;
}) {
  const params = await searchParams;
  const periodo = periodosValidos.includes(params.periodo as PeriodoRelatorio)
    ? (params.periodo as PeriodoRelatorio)
    : "mes";

  return <RelatoriosWorkspace periodo={periodo} tipo={params.tipo ?? "faturamento"} />;
}
