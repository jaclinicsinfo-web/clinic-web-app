"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, MoreHorizontal, Repeat } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistrarPagamentoDialog } from "@/components/financeiro/registrar-pagamento-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/status";
import type { Despesa } from "@/types";

interface ContasAPagarTableProps {
  despesas: Despesa[];
  categorias: string[];
}

export function ContasAPagarTable({ despesas, categorias }: ContasAPagarTableProps) {
  const [status, setStatus] = React.useState("todos");
  const [categoria, setCategoria] = React.useState("todas");
  const [pagando, setPagando] = React.useState<Despesa | null>(null);

  const dados = React.useMemo(() => {
    return despesas.filter((despesa) => {
      if (status !== "todos" && despesa.status !== status) return false;
      if (categoria !== "todas" && despesa.categoria !== categoria) return false;
      return true;
    });
  }, [despesas, status, categoria]);

  const columns = React.useMemo<ColumnDef<Despesa, unknown>[]>(
    () => [
      {
        accessorKey: "descricao",
        header: "Despesa",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.original.descricao}</p>
            {row.original.formaPagamento && (
              <p className="text-xs text-muted-foreground">
                {formaPagamentoLabels[row.original.formaPagamento]}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "categoria",
        header: "Categoria",
        cell: ({ row }) => <Badge tone="outline">{row.original.categoria}</Badge>,
      },
      {
        accessorKey: "fornecedor",
        header: "Fornecedor",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "valor",
        accessorFn: (row) => row.valor,
        header: "Valor",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-foreground">{formatCurrency(row.original.valor)}</span>
        ),
      },
      {
        id: "vencimento",
        accessorFn: (row) => formatDate(row.vencimento),
        header: "Vencimento",
        sortingFn: (a, b) => a.original.vencimento.localeCompare(b.original.vencimento),
        cell: ({ row }) => (
          <span
            className={
              row.original.status === "vencido"
                ? "font-medium tabular-nums text-danger"
                : "tabular-nums text-muted-foreground"
            }
          >
            {formatDate(row.original.vencimento)}
          </span>
        ),
      },
      {
        id: "recorrente",
        accessorFn: (row) => (row.recorrente ? "Mensal" : "Eventual"),
        header: "Recorrência",
        cell: ({ row }) =>
          row.original.recorrente ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
              <Repeat className="size-3.5 text-muted-foreground" />
              Mensal
            </span>
          ) : (
            <span className="text-muted-foreground">Eventual</span>
          ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="despesa" status={row.original.status} />,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false,
        size: 56,
        cell: ({ row }) => {
          const despesa = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Ações da despesa ${despesa.descricao}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={despesa.status === "pago"} onSelect={() => setPagando(despesa)}>
                    <CheckCircle2 />
                    Dar baixa no pagamento
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por despesa ou fornecedor..."
        exportFileName="contas-a-pagar"
        pageSize={12}
        emptyTitle="Nenhuma despesa encontrada"
        emptyDescription="Ajuste os filtros de status ou categoria para ver outros lançamentos."
        toolbar={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                <SelectItem value="a_pagar">A pagar</SelectItem>
                <SelectItem value="pago">Pagas</SelectItem>
                <SelectItem value="vencido">Vencidas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-52" aria-label="Filtrar por categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda categoria</SelectItem>
                {categorias.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <RegistrarPagamentoDialog
        open={Boolean(pagando)}
        onOpenChange={(aberto) => !aberto && setPagando(null)}
        title="Dar baixa no pagamento"
        description="Confirme o valor pago e a forma utilizada para liquidar a despesa."
        lancamento={
          pagando
            ? {
                titulo: pagando.descricao,
                subtitulo: `${pagando.categoria} · ${pagando.fornecedor}`,
                vencimento: pagando.vencimento,
                valor: pagando.valor,
              }
            : null
        }
        valorSugerido={pagando?.valor ?? 0}
        formaSugerida={pagando?.formaPagamento ?? null}
        dataLabel="Data do pagamento"
        confirmLabel="Confirmar baixa"
        onConfirm={(pagamento) => {
          toast.success("Despesa baixada", {
            description: `${pagando?.descricao ?? ""} · ${formatCurrency(pagamento.valor)} em ${formaPagamentoLabels[pagamento.formaPagamento]}`,
          });
          setPagando(null);
        }}
      />
    </>
  );
}
