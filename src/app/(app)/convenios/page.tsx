import type { Metadata } from "next";

import { ConveniosWorkspace } from "@/components/convenios/convenios-workspace";

export const metadata: Metadata = {
  title: "Convênios",
};

export default function ConveniosPage() {
  return <ConveniosWorkspace />;
}
