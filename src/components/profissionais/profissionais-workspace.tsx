"use client";

import * as React from "react";
import Link from "next/link";
import { Percent, Plus, Stethoscope, UserCheck, Users } from "lucide-react";

import { ProfissionaisTable } from "@/components/profissionais/profissionais-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { formatPercent } from "@/lib/format";
import {
  inativarProfissionalApi,
  listarProfissionaisApi,
  type ResumoProfissionais,
} from "@/services/profissionais";
import type { Profissional } from "@/types";

const resumoVazio: ResumoProfissionais = {
  total: 0,
  ativos: 0,
  especialidades: 0,
  comissaoMedia: 0,
};

export function ProfissionaisWorkspace() {
  const [profissionais, setProfissionais] = React.useState<Profissional[]>([]);
  const [especialidades, setEspecialidades] = React.useState<string[]>([]);
  const [resumo, setResumo] = React.useState<ResumoProfissionais>(resumoVazio);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setErro(null);
    try {
      const data = await listarProfissionaisApi();
      setProfissionais(data.profissionais);
      setEspecialidades(data.especialidades);
      setResumo(data.resumo);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os profissionais.");
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function inativar(profissional: Profissional) {
    const atualizado = await inativarProfissionalApi(profissional.id);
    setProfissionais((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
    setResumo((atual) => ({
      ...atual,
      ativos: Math.max(0, atual.ativos - (profissional.status === "ativo" ? 1 : 0)),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profissionais"
        description="Corpo clínico da clínica: vínculos, comissionamento e disponibilidade na agenda."
        actions={
          <Button asChild>
            <Link href="/profissionais/novo">
              <Plus />
              Novo profissional
            </Link>
          </Button>
        }
      />

      {erro ? (
        <EmptyState title="Não foi possível carregar" description={erro} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total de profissionais" value={String(resumo.total)} icon={Users} />
            <StatCard
              label="Profissionais ativos"
              value={String(resumo.ativos)}
              icon={UserCheck}
              hint={`${resumo.total - resumo.ativos} inativos`}
            />
            <StatCard
              label="Especialidades atendidas"
              value={String(resumo.especialidades)}
              icon={Stethoscope}
              hint="Especialidades distintas no corpo clínico"
            />
            <StatCard
              label="Comissão média"
              value={formatPercent(resumo.comissaoMedia)}
              icon={Percent}
              hint="Entre profissionais comissionados"
            />
          </div>

          <ProfissionaisTable profissionais={profissionais} especialidades={especialidades} onInativar={inativar} />
        </>
      )}
    </div>
  );
}
