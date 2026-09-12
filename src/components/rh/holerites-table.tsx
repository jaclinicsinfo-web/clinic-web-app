"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileText, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { HoleriteDialog } from "@/components/rh/holerite-dialog";
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
import { formatDate, formatNumber } from "@/lib/format";
import { baixarHoleriteApi, excluirHoleriteApi } from "@/services/rh";
import type { Holerite, UsuarioRh } from "@/types";

function formatCompetencia(competencia: string) {
  return format(parseISO(`${competencia}-01`), "MMM/yyyy", { locale: ptBR });
}

interface HoleritesTableProps {
  holerites: Holerite[];
  usuarios: UsuarioRh[];
  competencias: string[];
  competencia: string;
  usuarioFiltro: string;
  somenteProprios?: boolean;
  podeCriar: boolean;
  podeExcluir: boolean;
  onCompetencia: (competencia: string) => void;
  onUsuario: (usuarioId: string) => void;
  onSalvo: (holerite: Holerite) => void;
  onExcluido: (id: string) => void;
}

export function HoleritesTable({
  holerites,
  usuarios,
  competencias,
  competencia,
  usuarioFiltro,
  somenteProprios = false,
  podeCriar,
  podeExcluir,
  onCompetencia,
  onUsuario,
  onSalvo,
  onExcluido,
}: HoleritesTableProps) {
  const [novoAberto, setNovoAberto] = React.useState(false);
  const [excluindo, setExcluindo] = React.useState<Holerite | null>(null);

  async function baixar(holerite: Holerite) {
    try {
      const blob = await baixarHoleriteApi(holerite.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = holerite.nomeArquivo;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível baixar o holerite.");
    }
  }

  const columns = React.useMemo<ColumnDef<Holerite, unknown>[]>(
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
            } satisfies ColumnDef<Holerite, unknown>,
          ]
        : []),
      {
        accessorKey: "competencia",
        header: "Competência",
        cell: ({ row }) => <span className="capitalize">{formatCompetencia(row.original.competencia)}</span>,
      },
      {
        accessorKey: "nomeArquivo",
        header: "Arquivo",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm">{row.original.nomeArquivo}</p>
              <p className="text-xs text-muted-foreground">{formatNumber(row.original.tamanhoKb)} KB</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "criadoPorNome",
        header: "Enviado por",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate">{row.original.criadoPorNome}</p>
            <p className="text-xs text-muted-foreground">{formatDate(row.original.criadoEm)}</p>
          </div>
        ),
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${row.original.usuarioNome}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void baixar(row.original)}>
                <Download />
                Baixar
              </DropdownMenuItem>
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
    [podeExcluir, somenteProprios],
  );

  const competenciasOpcoes = competencias.includes(competencia) ? competencias : [competencia, ...competencias];

  return (
    <>
      <DataTable
        columns={columns}
        data={holerites}
        searchPlaceholder={somenteProprios ? "Buscar por competência ou arquivo..." : "Buscar por usuário ou arquivo..."}
        exportFileName="holerites"
        pageSize={12}
        emptyTitle={somenteProprios ? "Nenhum holerite seu nesta competência" : "Nenhum holerite nesta competência"}
        emptyDescription={
          somenteProprios
            ? "Quando o RH enviar o seu contracheque, ele aparece aqui."
            : "Envie o contracheque dos usuários para esta competência."
        }
        toolbar={
          <>
            <Input
              type="month"
              value={competencia}
              onChange={(event) => onCompetencia(event.target.value)}
              aria-label="Competência"
              className="w-44"
            />
            {competenciasOpcoes.length > 1 ? (
              <Select value={competencia} onValueChange={onCompetencia}>
                <SelectTrigger className="w-40" aria-label="Competências com arquivo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {competenciasOpcoes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {formatCompetencia(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
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
                Enviar holerite
              </Button>
            )}
          </>
        }
      />

      <HoleriteDialog
        open={novoAberto}
        onOpenChange={setNovoAberto}
        usuarios={usuarios}
        competencia={competencia}
        onSalvo={onSalvo}
      />

      <ConfirmDialog
        open={Boolean(excluindo)}
        onOpenChange={(aberto) => !aberto && setExcluindo(null)}
        title="Excluir holerite?"
        description={
          excluindo
            ? `O arquivo de ${excluindo.usuarioNome} (${formatCompetencia(excluindo.competencia)}) será removido.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (!excluindo) return;
          try {
            await excluirHoleriteApi(excluindo.id);
            onExcluido(excluindo.id);
            toast.success("Holerite excluído", { description: excluindo.usuarioNome });
            setExcluindo(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível excluir o holerite.");
          }
        }}
      />
    </>
  );
}
