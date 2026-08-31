import type { Metadata } from "next";

import { FinanceiroWorkspace } from "@/components/financeiro/financeiro-workspace";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function FinanceiroPage() {
  return <FinanceiroWorkspace />;
}
