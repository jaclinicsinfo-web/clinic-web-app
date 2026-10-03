import type { Metadata } from "next";

import { PrimeiroAcessoForm } from "@/components/auth/primeiro-acesso-form";

export const metadata: Metadata = {
  title: "Primeiro acesso",
};

export default function PrimeiroAcessoPage() {
  return <PrimeiroAcessoForm />;
}
