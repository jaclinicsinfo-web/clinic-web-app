"use client";

import * as React from "react";

import { ProfissionalPerfilShell } from "@/components/profissionais/profissional-perfil-shell";

export default function ProfissionalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <ProfissionalPerfilShell profissionalId={id}>{children}</ProfissionalPerfilShell>;
}
