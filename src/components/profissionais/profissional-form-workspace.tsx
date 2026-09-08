"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { FormPage } from "@/components/shared/form-page";
import { ProfissionalForm } from "@/components/profissionais/profissional-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  obterProfissionalApi,
  opcoesProfissionaisApi,
  type ProcedimentoOpcao,
  type UsuarioVinculo,
} from "@/services/profissionais";
import type { Profissional } from "@/types";

export function ProfissionalFormWorkspace({ profissionalId }: { profissionalId?: string }) {
  const edicao = Boolean(profissionalId);
  const [especialidades, setEspecialidades] = React.useState<string[]>([]);
  const [procedimentos, setProcedimentos] = React.useState<ProcedimentoOpcao[]>([]);
  const [usuarios, setUsuarios] = React.useState<UsuarioVinculo[]>([]);
  const [profissional, setProfissional] = React.useState<Profissional | undefined>();
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const opcoes = await opcoesProfissionaisApi();
        if (!ativo) return;
        setEspecialidades(opcoes.especialidades);
        setProcedimentos(opcoes.procedimentos);
        setUsuarios(opcoes.usuarios);
        if (profissionalId) {
          const detalhe = await obterProfissionalApi(profissionalId);
          if (!ativo) return;
          setProfissional(detalhe.profissional);
        }
      } catch (error) {
        if (!ativo) return;
        setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o formulário.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => {
      ativo = false;
    };
  }, [profissionalId]);

  if (carregando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  if (erro) {
    return (
      <EmptyState
        title={edicao ? "Profissional não encontrado" : "Não foi possível carregar"}
        description={erro}
        action={
          <Button variant="outline" asChild>
            <Link href="/profissionais">Voltar</Link>
          </Button>
        }
      />
    );
  }

  return (
    <FormPage
      header={
        <PageHeader
          title={edicao ? "Editar profissional" : "Novo profissional"}
          description={
            edicao
              ? profissional?.nome
              : "Cadastre o profissional, o vínculo contratual e a disponibilidade na agenda."
          }
          actions={
            <Button variant="outline" asChild>
              <Link href={edicao && profissionalId ? `/profissionais/${profissionalId}` : "/profissionais"}>
                <ArrowLeft />
                Voltar
              </Link>
            </Button>
          }
        />
      }
      contentClassName="flex min-h-0 flex-col overflow-hidden"
    >
      <ProfissionalForm
        especialidades={especialidades}
        procedimentos={procedimentos}
        usuarios={usuarios}
        profissional={profissional}
      />
    </FormPage>
  );
}
