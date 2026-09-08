"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { FormPage } from "@/components/shared/form-page";
import { PacienteForm } from "@/components/pacientes/paciente-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import { obterPacienteApi, opcoesPacientesApi, type OpcaoPaciente } from "@/services/pacientes";
import type { Paciente } from "@/types";

export function PacienteFormWorkspace({ pacienteId }: { pacienteId?: string }) {
  const edicao = Boolean(pacienteId);
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const podeSalvar = temPermissao(permissoes, "pacientes", edicao ? "editar" : "criar");
  const [convenios, setConvenios] = React.useState<OpcaoPaciente[]>([]);
  const [profissionais, setProfissionais] = React.useState<OpcaoPaciente[]>([]);
  const [paciente, setPaciente] = React.useState<Paciente | undefined>();
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!podeSalvar) return;

    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const opcoes = await opcoesPacientesApi();
        if (!ativo) return;
        setConvenios(opcoes.convenios);
        setProfissionais(opcoes.profissionais);

        if (pacienteId) {
          const detalhe = await obterPacienteApi(pacienteId);
          if (!ativo) return;
          setPaciente(detalhe.paciente);
        }
      } catch (error) {
        if (!ativo) return;
        setErro(
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar o formulário. Tente novamente.",
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [pacienteId, podeSalvar]);

  if (!podeSalvar) {
    return (
      <EmptyState
        title="Sem permissão"
        description={
          edicao
            ? "Seu perfil não pode editar pacientes."
            : "Seu perfil não pode cadastrar pacientes."
        }
        action={
          <Button variant="outline" asChild>
            <Link href="/pacientes">Voltar para pacientes</Link>
          </Button>
        }
      />
    );
  }

  if (carregando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando formulário" />
      </div>
    );
  }

  if (erro || (edicao && !paciente)) {
    return (
      <EmptyState
        title={edicao ? "Paciente não encontrado" : "Não foi possível abrir o cadastro"}
        description={erro ?? "O registro pode ter sido removido ou você não tem acesso."}
        action={
          <Button variant="outline" asChild>
            <Link href="/pacientes">Voltar para pacientes</Link>
          </Button>
        }
      />
    );
  }

  return (
    <FormPage
      className="mx-auto max-w-5xl"
      header={
        <PageHeader
          title={edicao ? "Editar paciente" : "Novo paciente"}
          description={
            edicao
              ? paciente?.nome
              : "Preencha os dados cadastrais, clínicos e os consentimentos exigidos pela LGPD."
          }
        />
      }
      contentClassName="flex min-h-0 flex-col overflow-hidden"
    >
      <PacienteForm convenios={convenios} profissionais={profissionais} paciente={paciente} />
    </FormPage>
  );
}
