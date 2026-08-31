"use client";

import { useProfissionalPerfil } from "@/components/profissionais/profissional-perfil-shell";
import { ProfissionalDocumentos } from "@/components/profissionais/profissional-documentos";

export default function ProfissionalDocumentosPage() {
  const { profissional } = useProfissionalPerfil();
  return <ProfissionalDocumentos profissionalNome={profissional.nome} />;
}
