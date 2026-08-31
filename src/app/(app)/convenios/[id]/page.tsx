import type { Metadata } from "next";

import { ConvenioDetalheWorkspace } from "@/components/convenios/convenio-detalhe-workspace";

export const metadata: Metadata = {
  title: "Convênio",
};

export default async function ConvenioDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConvenioDetalheWorkspace convenioId={id} />;
}
