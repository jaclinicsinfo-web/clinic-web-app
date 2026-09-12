import type { Metadata } from "next";

import { RhWorkspace } from "@/components/rh/rh-workspace";

export const metadata: Metadata = {
  title: "RH",
};

export default function RhPage() {
  return <RhWorkspace />;
}
