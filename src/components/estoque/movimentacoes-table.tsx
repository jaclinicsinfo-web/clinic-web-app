"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatNumber } from "@/lib/format";
import type { MovimentacaoEstoque } from "@/types";

interface MovimentacoesTableProps {
  movimentacoes: MovimentacaoEstoque[];
}

export function MovimentacoesTable({ movimentacoes }: MovimentacoesTableProps) {
  const [tipo, setTipo] = React.useState("todos");

  const dados = React.useMemo(
    () => movimentacoes.filter((movimentacao) => tipo === "todos" || movimentacao.tipo === tipo),
    [movimentacoes, tipo],
  );

  const columns = React.useMemo<ColumnDef<MovimentacaoEstoque, unknown>[]>(
    () => [
      {
        id: "data",
        accessorFn: (row) => formatDate(row.data),
        header: "Data",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        accessorKey: "produtoNome",
        header: "Produto",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.produtoNome}</span>,
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) =>
          row.original.tipo === "entrada" ? (
            <Badge tone="success">
              <ArrowDownLeft className="size-3" />
              Entrada
            </Badge>
          ) : (
            <Badge tone="warning">
              <ArrowUpRight className="size-3" />
              Saída
            </Badge>
          ),
      },
      {
        accessorKey: "quantidade",
        header: "Quantidade",
        cell: ({ row }) => (
          <span
            className={
              row.original.tipo === "entrada"
                ? "font-medium tabular-nums text-success"
                : "font-medium tabular-nums text-warning"
            }
          >
            {row.original.tipo === "entrada" ? "+" : "−"}
            {formatNumber(row.original.quantidade)}
          </span>
        ),
      },
      {
        accessorKey: "motivo",
        header: "Motivo",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.motivo}</span>,
      },
      {
        accessorKey: "responsavel",
        header: "Responsável",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={dados}
      searchPlaceholder="Buscar por produto, motivo ou responsável..."
      exportFileName="estoque-movimentacoes"
      pageSize={10}
      emptyTitle="Nenhuma movimentação encontrada"
      emptyDescription="Registre entradas de compra e saídas de consumo para acompanhar o histórico."
      toolbar={
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-40" aria-label="Filtrar por tipo de movimentação">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="saida">Saídas</SelectItem>
          </SelectContent>
        </Select>
      }
    />
  );
}
