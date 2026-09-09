"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarPlus, Loader2, Mail, Pencil, Phone } from "lucide-react";

import { ProfissionalTabs } from "@/components/profissionais/profissional-tabs";
import { Pode } from "@/components/auth/pode";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { formatPhone, getInitials } from "@/lib/format";
import { tipoVinculoLabels } from "@/lib/status";
import { obterProfissionalApi } from "@/services/profissionais";
import type { Agendamento, Comissao, Profissional } from "@/types";
import type { IndicadoresProfissional, PacienteDoProfissional } from "@/services/profissionais";

const ProfissionalPerfilContext = React.createContext<{
  profissional: Profissional;
  indicadores: IndicadoresProfissional;
  pacientesAtendidos: PacienteDoProfissional[];
  agenda: Agendamento[];
  procedimentosHabilitados: { id: string; nome: string }[];
  comissoes: Comissao[];
} | null>(null);

export function useProfissionalPerfil() {
  const contexto = React.useContext(ProfissionalPerfilContext);
  if (!contexto) {
    throw new Error("useProfissionalPerfil deve ser usado dentro de ProfissionalPerfilShell.");
  }
  return contexto;
}

export function ProfissionalPerfilShell({
  profissionalId,
  children,
}: {
  profissionalId: string;
  children: React.ReactNode;
}) {
  const [detalhe, setDetalhe] = React.useState<React.ContextType<typeof ProfissionalPerfilContext>>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await obterProfissionalApi(profissionalId);
        if (!ativo) return;
        setDetalhe({
          profissional: data.profissional,
          indicadores: data.indicadores,
          pacientesAtendidos: data.pacientesAtendidos,
          agenda: data.agenda,
          procedimentosHabilitados: data.procedimentosHabilitados,
          comissoes: data.comissoes ?? [],
        });
      } catch (error) {
        if (!ativo) return;
        setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o profissional.");
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
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando profissional" />
      </div>
    );
  }

  if (erro || !detalhe) {
    return (
      <EmptyState
        title="Profissional não encontrado"
        description={erro ?? "O registro pode ter sido removido."}
        action={
          <Button variant="outline" asChild>
            <Link href="/profissionais">Voltar para profissionais</Link>
          </Button>
        }
      />
    );
  }

  const { profissional } = detalhe;

  return (
    <ProfissionalPerfilContext.Provider value={detalhe}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <Avatar className="size-16">
                {profissional.fotoUrl && <AvatarImage src={profissional.fotoUrl} alt={profissional.nome} />}
                <AvatarFallback className="text-lg">{getInitials(profissional.nome)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">{profissional.nome}</h1>
                  <StatusBadge domain="profissional" status={profissional.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {profissional.especialidades.map((especialidade) => (
                    <Badge key={especialidade} tone="primary">
                      {especialidade}
                    </Badge>
                  ))}
                  <Badge tone="outline">
                    {profissional.conselho} {profissional.registroConselho}
                  </Badge>
                  <Badge tone="outline">{tipoVinculoLabels[profissional.tipoVinculo]}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {profissional.email}
                  </span>
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <Phone className="size-3.5" />
                    {formatPhone(profissional.telefone)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Pode modulo="profissionais" acao="editar">
                <Button variant="outline" asChild>
                  <Link href={`/profissionais/${profissional.id}/editar`}>
                    <Pencil />
                    Editar
                  </Link>
                </Button>
              </Pode>
              <Button asChild>
                <Link href={`/agenda?profissional=${profissional.id}&novo=1`}>
                  <CalendarPlus />
                  Novo agendamento
                </Link>
              </Button>
            </div>
          </div>
        </Card>
        <ProfissionalTabs profissionalId={profissional.id} />
        <div>{children}</div>
      </div>
    </ProfissionalPerfilContext.Provider>
  );
}
