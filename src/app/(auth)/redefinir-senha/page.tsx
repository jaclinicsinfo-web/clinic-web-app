import type { Metadata } from "next";

import { RedefinirSenhaForm } from "@/components/auth/redefinir-senha-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <RedefinirSenhaForm token={params.token ?? ""} />;
}
