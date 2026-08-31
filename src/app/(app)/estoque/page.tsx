import type { Metadata } from "next";

import { EstoqueWorkspace } from "@/components/estoque/estoque-workspace";

export const metadata: Metadata = {
  title: "Estoque",
};

export default function EstoquePage() {
  return <EstoqueWorkspace />;
}
