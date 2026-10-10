import type { Metadata } from "next";

import { AssinaturaView } from "@/components/configuracoes/assinatura-view";

export const metadata: Metadata = {
  title: "Assinatura",
};

export default function AssinaturaPage() {
  return <AssinaturaView />;
}
