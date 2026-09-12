"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { horaOuTraco } from "@/components/rh/labels";
import { PontoDialog } from "@/components/rh/ponto-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { formatDate, formatMinutes } from "@/lib/format";
import { excluirPontoApi } from "@/services/rh";
import type { RegistroPonto, UsuarioRh } from "@/types";

interface PontoTableProps {
  registros: RegistroPonto[];
  usuarios: UsuarioRh[];
  inicio: string;
  fim: string;
  dataPadrao: string;
  usuarioFiltro: string;
  somenteProprios?: boolean;
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
  onPeriodo: (inicio: string, fim: string) => void;
  onUsuario: (usuarioId: string) => void;
  onSalvo: (registro: RegistroPonto) => void;
  onExcluido: (id: string) => void;
}

export function PontoTable({
  registros,
  usuarios,
  inicio,
  fim,
  dataPadrao,
  usuarioFiltro,
  somenteProprios = false,
  podeCriar,
  podeEditar,
  podeExcluir,
  onPeriodo,
  onUsuario,
  onSalvo,
  onExcluido,
}: PontoTableProps) {
  const [novoAberto, setNovoAberto] = React.useState(false);
  const [editando, setEditando] = React.useState<RegistroPonto | null>(null);
  const [excluindo, setExcluindo] = React.useState<RegistroPonto | null>(null);

  const columns = React.useMemo<ColumnDef<RegistroPonto, unknown>[]>(
    () => [
      ...(!somenteProprios
        ? [
            {
              accessorKey: "usuarioNome",
              header: "Usuário",
              cell: ({ row }) => (
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{row.original.usuarioNome}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.original.perfilNome}</p>
                </div>
              ),
            } satisfies ColumnDef<RegistroPonto, unknown>,
          ]
        : []),
      {
        accessorKey: "data",
        header: "Data",
        cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.data)}</span>,
      },
      {
        accessorKey: "entrada",
        header: "Entrada",
        cell: ({ row }) => <span className="tabular-nums">{horaOuTraco(row.original.entrada)}</span>,
      },
      {
        accessorKey: "saidaIntervalo",
        header: "Intervalo",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {horaOuTraco(row.original.saidaIntervalo)} – {horaOuTraco(row.original.retornoIntervalo)}
          </span>
        ),
      },
      {
        accessorKey: "saida",
        header: "Saída",
        cell: ({ row }) => <span className="tabular-nums">{horaOuTraco(row.original.saida)}</span>,
      },
      {
        accessorKey: "horasTrabalhadas",
        header: "Horas",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.horasTrabalhadas ?? (row.original.minutosTrabalhados != null
              ? formatMinutes(row.original.minutosTrabalhados)
              : "—")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="ponto" status={row.original.status} />,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        cell: ({ row }) =>
          (podeEditar || podeExcluir) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${row.original.usuarioNome}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {podeEditar && (
                  <DropdownMenuItem onSelect={() => setEditando(row.original)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                )}
                {podeExcluir && (
                  <DropdownMenuItem destructive onSelect={() => setExcluindo(row.original)}>
                    <Trash2 />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
      },
    ],
    [podeEditar, podeExcluir, somenteProprios],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={registros}
        searchPlaceholder={somenteProprios ? "Buscar por data ou horário..." : "Buscar por usuário ou horário..."}
        exportFileName="controle-de-ponto"
        pageSize={12}
        emptyTitle={somenteProprios ? "Você ainda não tem ponto neste período" : "Nenhum ponto no período"}
        emptyDescription={
          somenteProprios
            ? "Bata o ponto do dia ou ajuste o intervalo de datas."
            : "Ajuste o intervalo ou lance o primeiro registro do dia."
        }
        toolbar={
          <>
            <Input
              type="date"
              value={inicio}
              onChange={(event) => onPeriodo(event.target.value, fim)}
              aria-label="Data inicial"
              className="w-40"
            />
            <Input
              type="date"
              value={fim}
              onChange={(event) => onPeriodo(inicio, event.target.value)}
              aria-label="Data final"
              className="w-40"
            />
            {!somenteProprios ? (
              <Select value={usuarioFiltro} onValueChange={onUsuario}>
                <SelectTrigger className="w-56" aria-label="Filtrar por usuário">
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {podeCriar && (
              <Button onClick={() => setNovoAberto(true)}>
                <Plus />
                Lançar ponto
              </Button>
            )}
          </>
        }
      />

      <PontoDialog
        open={novoAberto || Boolean(editando)}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setNovoAberto(false);
            setEditando(null);
          }
        }}
        usuarios={usuarios}
        dataPadrao={dataPadrao}
        registro={editando}
        onSalvo={onSalvo}
      />

      <ConfirmDialog
        open={Boolean(excluindo)}
        onOpenChange={(aberto) => !aberto && setExcluindo(null)}
        title="Excluir registro de ponto?"
        description={
          excluindo
            ? `O ponto de ${excluindo.usuarioNome} em ${formatDate(excluindo.data)} será removido.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (!excluindo) return;
          try {
            await excluirPontoApi(excluindo.id);
            onExcluido(excluindo.id);
            toast.success("Ponto excluído", { description: excluindo.usuarioNome });
            setExcluindo(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível excluir o ponto.");
          }
        }}
      />
    </>
  );
}
