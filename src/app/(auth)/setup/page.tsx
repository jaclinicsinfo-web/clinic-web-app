import type { Metadata } from "next";

import { SetupForm } from "@/components/auth/setup-form";

export const metadata: Metadata = {
  title: "Configurar clínica",
};

export default function SetupPage() {
  return <SetupForm />;
}
