"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { formatNumber } from "@/lib/format";
import type { ConsumoEstoque } from "@/types";

export function ConsumoTable({ consumo }: { consumo: ConsumoEstoque[] }) {
  const columns = React.useMemo<ColumnDef<ConsumoEstoque, unknown>[]>(
    () => [
      {
        accessorKey: "produtoNome",
        header: "Produto",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.produtoNome}</span>,
      },
      {
        accessorKey: "quantidade",
        header: "Quantidade consumida",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatNumber(row.original.quantidade, 2)}</span>
        ),
      },
      {
        accessorKey: "ocorrencias",
        header: "Saídas",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{formatNumber(row.original.ocorrencias)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={consumo}
      searchPlaceholder="Buscar produto no consumo..."
      exportFileName="estoque-consumo"
      pageSize={10}
      emptyTitle="Nenhum consumo registrado"
      emptyDescription="As saídas de estoque aparecem aqui agrupadas por produto."
    />
  );
}
