import type { Metadata } from "next";

import { PontoWorkspace } from "@/components/rh/ponto-workspace";

export const metadata: Metadata = {
  title: "Controle de ponto",
};

export default function PontoPage() {
  return <PontoWorkspace />;
}
