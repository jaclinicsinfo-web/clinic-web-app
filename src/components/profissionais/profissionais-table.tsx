"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, MoreHorizontal, Pencil, Power, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPercent, getInitials } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import { temPermissao } from "@/lib/permissoes";
import { formaRemuneracaoLabels, tipoVinculoLabels } from "@/lib/status";
import { useSessaoStore } from "@/hooks/use-sessao";
import type { Profissional } from "@/types";

interface ProfissionaisTableProps {
  profissionais: Profissional[];
  especialidades: string[];
  onInativar?: (profissional: Profissional) => Promise<void> | void;
  onAtivar?: (profissional: Profissional) => Promise<void> | void;
}

export function ProfissionaisTable({ profissionais, especialidades, onInativar, onAtivar }: ProfissionaisTableProps) {
  const router = useRouter();
  const sessao = useSessaoStore((state) => state.sessao);
  const permissoes = sessao?.permissoes;
  const podeEditar = temPermissao(permissoes, "profissionais", "editar");
  const podeDesativar = temPermissao(permissoes, "profissionais", "excluir");
  const mostraFinanceiro = planoIncluiModulo(sessao?.plano, "financeiro") && temPermissao(permissoes, "financeiro");
  const [status, setStatus] = React.useState("todos");
  const [especialidade, setEspecialidade] = React.useState("todas");
  const [vinculo, setVinculo] = React.useState("todos");
  const [inativando, setInativando] = React.useState<Profissional | null>(null);
  const [ativando, setAtivando] = React.useState<Profissional | null>(null);

  const dados = React.useMemo(() => {
    return profissionais.filter((profissional) => {
      if (status !== "todos" && profissional.status !== status) return false;
      if (especialidade !== "todas" && !profissional.especialidades.includes(especialidade)) return false;
      if (vinculo !== "todos" && profissional.tipoVinculo !== vinculo) return false;
      return true;
    });
  }, [profissionais, status, especialidade, vinculo]);

  const columns = React.useMemo<ColumnDef<Profissional, unknown>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Profissional",
        cell: ({ row }) => {
          const profissional = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9">
                {profissional.fotoUrl && <AvatarImage src={profissional.fotoUrl} alt={profissional.nome} />}
                <AvatarFallback>{getInitials(profissional.nome)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  href={`/profissionais/${profissional.id}`}
                  className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {profissional.nome}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{profissional.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "especialidades",
        accessorFn: (row) => row.especialidades.join(", "),
        header: "Especialidades",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.especialidades.map((item) => (
              <Badge key={item} tone="primary">
                {item}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: "conselho",
        accessorFn: (row) => `${row.conselho} ${row.registroConselho}`,
        header: "Conselho",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "vinculo",
        accessorFn: (row) => tipoVinculoLabels[row.tipoVinculo],
        header: "Vínculo",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{tipoVinculoLabels[row.original.tipoVinculo]}</p>
            <p className="text-xs text-muted-foreground">
              {formaRemuneracaoLabels[row.original.formaRemuneracao]}
            </p>
          </div>
        ),
      },
      ...(mostraFinanceiro
        ? [
            {
              id: "percentualComissao",
              accessorFn: (row: Profissional) => row.percentualComissao,
              header: "Comissão",
              cell: ({ row }: { row: { original: Profissional } }) => {
                const percentual = row.original.percentualComissao;
                return percentual > 0 ? (
                  <span className="font-medium tabular-nums text-foreground">{formatPercent(percentual, 0)}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                );
              },
            } satisfies ColumnDef<Profissional, unknown>,
          ]
        : []),
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="profissional" status={row.original.status} />,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false,
        size: 56,
        cell: ({ row }) => {
          const profissional = row.original;
          return (
            <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${profissional.nome}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => router.push(`/profissionais/${profissional.id}`)}>
                    <Stethoscope />
                    Ver perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push(`/profissionais/${profissional.id}/agenda`)}>
                    <CalendarDays />
                    Ver agenda
                  </DropdownMenuItem>
                  {podeEditar && (
                    <DropdownMenuItem onSelect={() => router.push(`/profissionais/${profissional.id}/editar`)}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {podeDesativar && (
                    <>
                      <DropdownMenuSeparator />
                      {profissional.status === "ativo" ? (
                        <DropdownMenuItem destructive onSelect={() => setInativando(profissional)}>
                          <Power />
                          Inativar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onSelect={() => setAtivando(profissional)}>
                          <Power />
                          Reativar
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [router, podeEditar, podeDesativar, mostraFinanceiro],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por nome, e-mail ou registro..."
        onRowClick={(profissional) => router.push(`/profissionais/${profissional.id}`)}
        exportFileName="profissionais"
        emptyTitle="Nenhum profissional encontrado"
        emptyDescription="Ajuste os filtros ou cadastre um novo profissional."
        toolbar={
          <>
            <Select value={especialidade} onValueChange={setEspecialidade}>
              <SelectTrigger className="w-48" aria-label="Filtrar por especialidade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda especialidade</SelectItem>
                {especialidades.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vinculo} onValueChange={setVinculo}>
              <SelectTrigger className="w-36" aria-label="Filtrar por vínculo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo vínculo</SelectItem>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="pj">PJ</SelectItem>
                <SelectItem value="autonomo">Autônomo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(inativando)}
        onOpenChange={(aberto) => !aberto && setInativando(null)}
        title="Inativar profissional?"
        description={`${inativando?.nome ?? ""} deixará de receber novos agendamentos. Os atendimentos já realizados e as comissões continuam no histórico.`}
        confirmLabel="Inativar"
        onConfirm={async () => {
          if (!inativando) return;
          try {
            if (onInativar) await onInativar(inativando);
            toast.success("Profissional inativado", { description: inativando.nome });
            setInativando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível inativar o profissional.");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(ativando)}
        onOpenChange={(aberto) => !aberto && setAtivando(null)}
        title="Reativar profissional?"
        description={`${ativando?.nome ?? ""} voltará a aparecer na agenda e poderá receber novos agendamentos.`}
        confirmLabel="Reativar"
        destructive={false}
        onConfirm={async () => {
          if (!ativando) return;
          try {
            if (onAtivar) await onAtivar(ativando);
            toast.success("Profissional reativado", { description: ativando.nome });
            setAtivando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível reativar o profissional.");
          }
        }}
      />
    </>
  );
}
