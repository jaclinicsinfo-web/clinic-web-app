import type { Metadata } from "next";

import { ConvenioDetalheWorkspace } from "@/components/convenios/convenio-detalhe-workspace";

export const metadata: Metadata = {
  title: "Convênio",
};

export default async function ConvenioDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ editar?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <ConvenioDetalheWorkspace convenioId={id} abrirEdicao={query.editar === "1"} />;
}
