import type { Metadata } from "next";

import { HoleritesWorkspace } from "@/components/rh/holerites-workspace";

export const metadata: Metadata = {
  title: "Holerites",
};

export default function HoleritesPage() {
  return <HoleritesWorkspace />;
}
