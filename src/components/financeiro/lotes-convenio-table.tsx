"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoteDetalheDialog } from "@/components/financeiro/lote-detalhe-dialog";
import { formatCompetencia } from "@/components/financeiro/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { LoteConvenio } from "@/types";

interface LotesConvenioTableProps {
  lotes: LoteConvenio[];
  convenios: { id: string; nome: string }[];
}

export function LotesConvenioTable({ lotes, convenios }: LotesConvenioTableProps) {
  const [convenio, setConvenio] = React.useState("todos");
  const [status, setStatus] = React.useState("todos");
  const [detalhando, setDetalhando] = React.useState<LoteConvenio | null>(null);

  const dados = React.useMemo(() => {
    return lotes.filter((lote) => {
      if (convenio !== "todos" && lote.convenioId !== convenio) return false;
      if (status !== "todos" && lote.status !== status) return false;
      return true;
    });
  }, [lotes, convenio, status]);

  const columns = React.useMemo<ColumnDef<LoteConvenio, unknown>[]>(
    () => [
      {
        accessorKey: "convenioNome",
        header: "Convênio",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.original.convenioNome}</p>
            <p className="text-xs text-muted-foreground">Lote {row.original.id.replace("lote-", "")}</p>
          </div>
        ),
      },
      {
        id: "competencia",
        accessorFn: (row) => formatCompetencia(row.competencia),
        header: "Competência",
        sortingFn: (a, b) => a.original.competencia.localeCompare(b.original.competencia),
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "quantidadeGuias",
        accessorFn: (row) => row.quantidadeGuias,
        header: "Guias",
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.quantidadeGuias)}</span>,
      },
      {
        id: "valorApresentado",
        accessorFn: (row) => row.valorApresentado,
        header: "Apresentado",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-foreground">
            {formatCurrency(row.original.valorApresentado)}
          </span>
        ),
      },
      {
        id: "valorGlosado",
        accessorFn: (row) => row.valorGlosado,
        header: "Glosado",
        cell: ({ row }) => {
          const lote = row.original;
          const taxa = lote.valorApresentado > 0 ? (lote.valorGlosado / lote.valorApresentado) * 100 : 0;
          return lote.valorGlosado > 0 ? (
            <div>
              <p className="font-medium tabular-nums text-danger">{formatCurrency(lote.valorGlosado)}</p>
              <p className="text-xs text-muted-foreground">{formatPercent(taxa)} do apresentado</p>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "valorRecebido",
        accessorFn: (row) => row.valorRecebido,
        header: "Recebido",
        cell: ({ row }) =>
          row.original.valorRecebido > 0 ? (
            <span className="font-medium tabular-nums text-success">{formatCurrency(row.original.valorRecebido)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="lote" status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por convênio..."
        exportFileName="faturamento-convenios"
        pageSize={12}
        onRowClick={(lote) => setDetalhando(lote)}
        emptyTitle="Nenhum lote encontrado"
        emptyDescription="Ajuste os filtros de convênio ou status para ver outros lotes."
        toolbar={
          <>
            <Select value={convenio} onValueChange={setConvenio}>
              <SelectTrigger className="w-44" aria-label="Filtrar por convênio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo convênio</SelectItem>
                {convenios.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40" aria-label="Filtrar por status do lote">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                <SelectItem value="aberto">Abertos</SelectItem>
                <SelectItem value="enviado">Enviados</SelectItem>
                <SelectItem value="pago">Pagos</SelectItem>
                <SelectItem value="parcial">Pagos parcialmente</SelectItem>
                <SelectItem value="glosado">Glosados</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <LoteDetalheDialog
        lote={detalhando}
        onOpenChange={(aberto) => !aberto && setDetalhando(null)}
        onConciliar={(lote) => {
          toast.success("Recebimento conciliado", {
            description: `${lote.convenioNome} · competência ${formatCompetencia(lote.competencia)}`,
          });
          setDetalhando(null);
        }}
      />
    </>
  );
}
